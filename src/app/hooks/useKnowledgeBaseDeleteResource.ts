"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Paginated, Resource } from "../api/stackai/utils";

export function useKnowledgeBaseDeleteResource({
  knowledgeBaseId,
  resourceId,
  page,
}: {
  knowledgeBaseId: string | null;
  resourceId: string;
  page: string | null;
}) {
  const queryClient = useQueryClient();
  const key = ["knowledge-base-children", knowledgeBaseId, resourceId, page];
  
  return useMutation({
    mutationFn: async (resourcePath: string) => {
      if (!knowledgeBaseId) {
        throw new Error("Missing knowledge base id");
      }
      const searchParams = new URLSearchParams({ resource_path: resourcePath });
      const response = await fetch(
        `/api/stackai/kb/${knowledgeBaseId}/resources?${searchParams.toString()}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Delete failed");
      return resourcePath;
    },

    // Optimistic update of cache 
    onMutate: async (resourcePath) => {
      await queryClient.cancelQueries({ queryKey: key }); // Prevents refetching of data
      const prev = queryClient.getQueryData<Paginated<Resource>>(key); //Snapshot for rollback
      queryClient.setQueryData<Paginated<Resource>>(key, old =>
        old ? { ...old, data: old.data.filter(i => i.inode_path.path !== resourcePath) } : old
      );
      return { prev };
    },

    onError: (_e, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(key, context.prev);
    },
  });
}
