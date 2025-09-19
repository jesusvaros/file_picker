"use client";
import { useAppContext } from "@/app/providers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { startTransition } from "react";
import type { Paginated, Resource } from "../api/stackai/utils";

type IndexingParams = { ocr: boolean; unstructured: boolean };

type CreateKbResponse = {
  knowledge_base_id: string;
  created_at?: string;
};

// Variables and helper types for the mutation
type SelectedResource = {
  resource_id: string;                 // from connection children
  inode_type: string;
  path: string;                        // i.inode_path.path
};

type CreateKbVars = {
  connectionId: string;
  selectionResources: SelectedResource[]; // Drive IDs (resource_id) from children endpoint
  indexingParams?: IndexingParams; // optional
  orgId: string; // needed for sync
};

// Local staging type to allow an extra transient status flag in cache
type StagingResource = import("../api/stackai/utils").Resource & { status?: "pending" };

export function useCreateKbWithResources() {
  const { setKbId } = useAppContext();
  const qc = useQueryClient();

  return useMutation<CreateKbResponse, Error, CreateKbVars, { stagingKey: (string | null)[] }>({
    onMutate: ({ selectionResources }: CreateKbVars) => {
      const stagingKey: (string | null)[] = ["kb-children:staging"];
      console.log(selectionResources)

      const pending = selectionResources.map((i) => ({
        resource_id: i.resource_id,
        inode_type: i.inode_type ,
        inode_path: { path: i.path },
        status: "pending",
      }));

      qc.setQueryData<Paginated<StagingResource>>(stagingKey, (old) => {
        const prev = old?.data ?? [];
        const m = new Map<string, StagingResource>();
        [...prev, ...pending].forEach((it) => m.set(it.resource_id, it as StagingResource));
        const next = { data: [...m.values()], next_cursor: old?.next_cursor ?? null, current_cursor: old?.current_cursor ?? null } as Paginated<StagingResource>;
        return next;
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

      const uniqueIds = Array.from(new Set(selectionResources.map((r) => r.resource_id)));

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
        throw new Error(`KB creation failed (${createRes.status}) ${txt}`);
      }
      const kb: CreateKbResponse = await createRes.json();

      const syncRes = await fetch(`/api/stackai/kb/sync/trigger/${kb.knowledge_base_id}/${orgId}`);
      if (!syncRes.ok) {
        const txt = await syncRes.text().catch(() => "");
        throw new Error(`KB sync trigger failed (${syncRes.status}) ${txt}`);
      }

      return kb;
    },

    // migrate staging -> real key, then flip kbId
    onSuccess: async (kb, _vars, ctx) => {
      const realKey = ["kb-children", kb.knowledge_base_id, "/", null] as const;

      const stagingData = ctx?.stagingKey
        ? (qc.getQueryData(ctx.stagingKey) as Paginated<Resource> | undefined)
        : undefined;

      if (stagingData) {
        qc.setQueryData(realKey, stagingData); // show optimistic list immediately
      }

      // trigger real fetch to replace pending with actual statuses
      qc.invalidateQueries({ queryKey: realKey, exact: true });

      startTransition(() => setKbId(kb.knowledge_base_id));

      if (ctx?.stagingKey) qc.removeQueries({ queryKey: ctx.stagingKey, exact: true });
    },

    onError: (_e, _vars, ctx) => {
      if (ctx?.stagingKey) qc.removeQueries({ queryKey: ctx.stagingKey, exact: true });
    },
  });
}
