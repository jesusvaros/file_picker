"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useIndexExistingResources() {
  const qc = useQueryClient();

  return useMutation({
    
    mutationFn: async ({
      connectionId,
      resourceIds,      // 1..N Drive IDs from the children endpoint
      indexingParams,   // optional, keep it minimal for test
      orgId,            // needed to call sync
    }: {
      connectionId: string;
      resourceIds: string[];
      indexingParams?: {
        ocr: boolean;
        unstructured: boolean;
      };
      orgId: string;
    }) => {
      // 1) Create KB (or update) with the selected resources
      const createRes = await fetch(`/api/stackai/kb`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connection_id: connectionId,
          connection_source_ids: resourceIds,
          indexing_params: indexingParams ?? {
            ocr: false,
            unstructured: true,
          },
          org_level_role: null,
          cron_job_id: null,
        }),
      });
      if (!createRes.ok) throw new Error("KB creation failed");
      const kb = await createRes.json(); // { knowledge_base_id, ... }

      // 2) Trigger sync
      const syncRes = await fetch(
        `/api/stackai/kb/sync/trigger/${kb.knowledge_base_id}/${orgId}`
      );
      if (!syncRes.ok) throw new Error("KB sync trigger failed");

      return kb; // return { knowledge_base_id, ... }
    },
  });
}
