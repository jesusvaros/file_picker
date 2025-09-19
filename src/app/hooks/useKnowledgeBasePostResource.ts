"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Paginated } from "../api/stackai/utils";

export type KBResource = {
  resource_id: string;
  inode_type: "file" | "directory";
  inode_path: { path: string };
  status?: "pending" | "indexed" | "failed";
};

export function useKnowledgeBasePostResource({
  knowledgeBaseId,
  resourceId,
  page,
}: {
  knowledgeBaseId: string | null;
  resourceId: string;
  page: string | null;
}) {
  const qc = useQueryClient();
  const key = ["knowledge-base-children", knowledgeBaseId, resourceId, page];

  return useMutation({
    mutationFn: async ({
      resourcePath,
      recursive = false,
      resourceType = "file",
      file, // optional
    }: {
      resourcePath: string;
      recursive?: boolean;
      resourceType?: "file" | "directory";
      file?: File | null;
    }) => {
      if (!knowledgeBaseId) throw new Error("Missing knowledge base id");

      const formData = new FormData();
      formData.append("resource_path", resourcePath);
      formData.append("resource_type", resourceType);

      if (recursive != null) formData.append("recursive", String(recursive));
      if (file) formData.append("file", file, file.name);

      const res = await fetch(`/api/stackai/kb/${knowledgeBaseId}/resources`, {
        method: "POST",
        body: formData, 
      });
      if (!res.ok) throw new Error("Index failed");
      return (await res.json()) as KBResource;
    },

    // Optimistic: add "pending" item
    onMutate: async ({ resourcePath, resourceType = "file" }) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<Paginated<KBResource>>(key);

      qc.setQueryData<Paginated<KBResource>>(key, (old) =>
        old
          ? {
              ...old,
              data: [
                ...old.data,
                {
                  resource_id: "temp-" + Date.now(),
                  inode_type: resourceType,
                  inode_path: { path: resourcePath },
                  status: "pending",
                },
              ],
            }
          : old
      );

      return { prev };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
    },
  });
}
