"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { Paginated } from "@/domain/pagination";
import type { Resource } from "@/domain/resource";
import { useAppContext } from "@/app/providers";

const generateParentPaths = (path: string): string[] => {
  if (path === "/" || path === "") return ["/"];

  const segments = path.split("/").filter(Boolean);

  return [
    "/",
    ...segments.map((_, index) => "/" + segments.slice(0, index + 1).join("/")),
  ];
};

export function useKnowledgeBaseDelete({
  page,
  resourcePath,
  parentResourcePath,
}: {
  page: string | null;
  resourcePath: string;
  parentResourcePath: string;
}) {
  const queryClient = useQueryClient();
  const { kbId } = useAppContext();

  const parentPaths = generateParentPaths(parentResourcePath);
  const kbChildrenKeys = parentPaths.map((path) => [
    "kb-children",
    kbId,
    path,
    page,
  ]);

  const toastId = `kb-children-delete[${resourcePath}]`;

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

      const searchParams = new URLSearchParams({
        resource_path: resourcePath,
      });
      const response = await fetch(
        `/api/stackai/kb/${kbId}/resources?${searchParams.toString()}`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        toast.error("Delete failed", {
          description: "Please try again",
          duration: 3000,
          id: toastId,
        });
        return;
      }

      kbChildrenKeys.forEach((key) => {
        queryClient.refetchQueries({ queryKey: key });
      });

      toast.success("Deleted successfully", {
        description: "The item has been removed from your knowledge base",
        duration: 3000,
        id: toastId,
      });

      return resourcePath;
    },

    onMutate: async () => {
      const kbChildrenKey = ["kb-children", kbId, parentResourcePath, page];
      await queryClient.cancelQueries({ queryKey: kbChildrenKey });

      const prevKbChildren =
        queryClient.getQueryData<Paginated<Resource>>(kbChildrenKey);

      if (prevKbChildren) {
        queryClient.setQueryData<Paginated<Resource>>(kbChildrenKey, {
          ...prevKbChildren,
          data: prevKbChildren.data.filter(
            (item) => item.inode_path.path !== resourcePath,
          ),
        });
      }

      return { prevKbChildren, kbChildrenKey };
    },

    onError: (_e, _vars, context) => {
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
