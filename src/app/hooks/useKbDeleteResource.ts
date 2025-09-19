"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Paginated, Resource } from "../api/stackai/utils";
import { useAppContext } from "../providers";

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
  const key = ["knowledge-base-children", kbId, resource_path, page];
  const kbChildrenKey = ["kb-children", kbId, parentResourcePath, page];
  
  return useMutation({
    mutationFn: async () => {
      if (!kbId) {
        throw new Error("Missing knowledge base id");
      }
      const searchParams = new URLSearchParams({ resource_path: resource_path });
      const response = await fetch(
        `/api/stackai/kb/${kbId}/resources?${searchParams.toString()}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Delete failed");
      queryClient.refetchQueries({ queryKey: kbChildrenKey });
      return resource_path;
    },

    // Optimistic update of cache 
    onMutate: async () => {
      const old = queryClient.getQueryData<Paginated<Resource>>(key);
      queryClient.setQueryData<Paginated<Resource>>(key, old =>
        old ? { ...old, data: old.data.filter(i => i.inode_path.path !== resource_path) } : old
      );
      return { prev: old };
    },

    onError: (_e, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(key, context.prev);
    },
  });
}
