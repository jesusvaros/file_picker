"use client";
import { useAppContext } from "@/app/providers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Paginated } from "../api/stackai/utils";

type IndexingParams = { ocr: boolean; unstructured: boolean };

type CreateKbResponse = {
  knowledge_base_id: string;
  created_at?: string;
};

type SelectedResource = {
  resource_id: string;
  inode_type: string;
  path: string;
};

type CreateKbVars = {
  connectionId: string;
  selectionResources: SelectedResource[];
  indexingParams?: IndexingParams;
  orgId: string;
};

// Local staging type to allow an extra transient status flag in cache
type StagingResource = import("../api/stackai/utils").Resource & {
  status?: "pending";
};

export function useCreateKbWithResources() {
  const { setKbId } = useAppContext();
  const qc = useQueryClient();

  const toastId = "kb-children:staging";

  return useMutation<
    CreateKbResponse,
    Error,
    CreateKbVars,
    { stagingKey: (string | null)[] }
  >({
    onMutate: ({ selectionResources }: CreateKbVars) => {
      const stagingKey: (string | null)[] = ["kb-children:staging"];

      const pending = selectionResources.map((i) => ({
        resource_id: i.resource_id,
        inode_type: i.inode_type,
        inode_path: { path: i.path },
        status: "pending",
      }));

      qc.setQueryData<Paginated<StagingResource>>(stagingKey, (old) => {
        const prev = old?.data ?? [];
        const m = new Map<string, StagingResource>();
        [...prev, ...pending].forEach((it) =>
          m.set(it.resource_id, it as StagingResource),
        );
        const next = {
          data: [...m.values()],
          next_cursor: old?.next_cursor ?? null,
          current_cursor: old?.current_cursor ?? null,
        } as Paginated<StagingResource>;
        return next;
      });

      toast.loading("Indexing resources", {
        description: "This may take a few minutes",
        duration: 3000,
        id: toastId,
      });

      return { stagingKey: stagingKey };
    },

    mutationFn: async ({
      connectionId,
      selectionResources,
      indexingParams,
      orgId,
    }: CreateKbVars): Promise<CreateKbResponse> => {
      if (!connectionId) throw new Error("Missing connectionId");
      if (!orgId) throw new Error("Missing orgId");
      if (!selectionResources?.length) throw new Error("No resources selected");

      const uniqueIds = Array.from(
        new Set(selectionResources.map((r) => r.resource_id)),
      );

      const createRes = await fetch(`/api/stackai/kb`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connection_id: connectionId,
          connection_source_ids: uniqueIds,
          indexing_params: indexingParams ?? { ocr: false, unstructured: true },
          org_level_role: null,
          cron_job_id: null,
        }),
      });
      if (!createRes.ok) {
        const txt = await createRes.text().catch(() => "");
        toast.error(`KB creation failed (${createRes.status}) ${txt}`, {
          id: toastId,
        });
      }
      const kb: CreateKbResponse = await createRes.json();

      const syncRes = await fetch(
        `/api/stackai/kb/sync/trigger/${kb.knowledge_base_id}/${orgId}`,
      );
      if (!syncRes.ok) {
        const txt = await syncRes.text().catch(() => "");
        toast.error(`KB sync trigger failed (${syncRes.status}) ${txt}`, {
          id: toastId,
        });
      }

      return kb;
    },

    onSuccess: async (kb) => {
      setKbId(kb.knowledge_base_id);
      toast.success("KB created successfully", {
        description: "The knowledge base has been created",
        duration: 3000,
        id: toastId,
      });
    },

    onError: (_e, _vars, ctx) => {
      if (ctx?.stagingKey)
        qc.removeQueries({ queryKey: ctx.stagingKey, exact: true });
      toast.error("KB creation failed", { id: toastId });
    },
  });
}
