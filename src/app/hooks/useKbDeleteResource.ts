"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Paginated, Resource } from "../api/stackai/utils";
import { useAppContext } from "../providers";

// Helper function to generate all parent paths using ES6 methods
const generateParentPaths = (path: string): string[] => {
  if (path === '/' || path === '') return ['/'];
  
  const segments = path.split('/').filter(Boolean);
  
  return ['/', ...segments.map((_, index) => 
    '/' + segments.slice(0, index + 1).join('/')
  )];
};

export function useKbDeleteResource({
  page,
  resource_path,
  parentResourcePath,
}: {
  page: string | null;
  resource_path: string;
  parentResourcePath: string;
}) {
  const queryClient = useQueryClient();
  const { kbId } = useAppContext();
  
  // Generate all parent paths that need to be updated
  const parentPaths = generateParentPaths(parentResourcePath);
  const kbChildrenKeys = parentPaths.map(path => ["kb-children", kbId, path, page]);

  const toastId = `kb-children-delete[${resource_path}]`;

  
  return useMutation({
    mutationFn: async () => {
      if (!kbId) {
        toast.error("Missing knowledge base id", {
          description: "Please try again",
          duration: 3000,
          id: toastId,
        });
        return;
      }

      toast.loading("Deleting resource", {
        description: "This may take a few minutes",
        duration: 3000,
        id: toastId,
      });

      const searchParams = new URLSearchParams({ resource_path: resource_path });
      const response = await fetch(
        `/api/stackai/kb/${kbId}/resources?${searchParams.toString()}`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        toast.error("Delete failed", {
          description: "Please try again",
          duration: 3000,
          id: toastId,
        });
        return;
      }
      
      // Refetch all parent paths using ES6 forEach
      kbChildrenKeys.forEach(key => {
        queryClient.refetchQueries({ queryKey: key });
      });
      
      toast.success("Deleted successfully", {
        description: "The item has been removed from your view",
        duration: 3000,
        id: toastId,
      });
      
      return resource_path;
    },

    // Optimistic update of cache 
    onMutate: async () => {
      const kbChildrenKey = ["kb-children", kbId, parentResourcePath, page];
      await queryClient.cancelQueries({ queryKey: kbChildrenKey });
      
      // Get the current KB children data
      const prevKbChildren = queryClient.getQueryData<Paginated<Resource>>(kbChildrenKey);
      
      // Optimistically remove the deleted item from KB children data
      if (prevKbChildren) {
        queryClient.setQueryData<Paginated<Resource>>(kbChildrenKey, {
          ...prevKbChildren,
          data: prevKbChildren.data.filter(item => item.inode_path.path !== resource_path)
        });
      }
      
      return { prevKbChildren, kbChildrenKey };
    },

    onError: (_e, _vars, context) => {
      // Rollback the optimistic update on error
      if (context?.prevKbChildren) {
        queryClient.setQueryData(context.kbChildrenKey, context.prevKbChildren);
      }

      toast.error("Delete failed", {
        description: "Please try again",
        duration: 3000,
        id: toastId,
      });
    },
  });
}
