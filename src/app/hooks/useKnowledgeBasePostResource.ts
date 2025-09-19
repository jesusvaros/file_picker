"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { kbPostResourceType } from "../api/stackai/kb/[kbId]/resources/route";
import { Resource } from "../api/stackai/utils";

export function useKnowledgeBasePostResource({
  knowledgeBaseId,
  listingKey, // la misma queryKey que uses para listar KB children
}: {
  knowledgeBaseId: string | null;
  listingKey: (string | null | undefined)[];
}) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ resource_path, resource_type }:kbPostResourceType ) => {
      if (!knowledgeBaseId) throw new Error("Missing knowledge base id");

      const fd = new FormData();
      fd.append("resource_path", resource_path);
      fd.append("resource_type", resource_type);
      fd.append("recursive", String(Boolean(resource_type === "directory")));



      const res = await fetch(`/api/stackai/kb/${knowledgeBaseId}/resources`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Index failed (${res.status}) ${txt}`);
      }

      // el backend puede devolver vacío; devolvemos null o el json
      try {
        return (await res.json()) as Resource | null;
      } catch {
        return null;
      }
    },

    // Optimistic: añadimos un item "pending"
    onMutate: async ({ resource_path, resource_type }) => {
      await qc.cancelQueries({ queryKey: listingKey });
      const prev = qc.getQueryData<{ data: Resource[] }>(listingKey);

      qc.setQueryData(listingKey, (old: { data: Resource[] }) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: [
            ...old.data,
            {
              resource_id: `temp-${Date.now()}`,
              inode_type: resource_type,
              inode_path: { path: resource_path },
              status: "pending",
            },
          ],
        };
      });

      return { prev };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(listingKey, ctx.prev);
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: listingKey });
    },
  });
}
