"use client";
import { useAppContext } from "@/app/providers";
import { useMutation } from "@tanstack/react-query";

type IndexingParams = { ocr: boolean; unstructured: boolean };

type CreateKbResponse = {
  knowledge_base_id: string;
  created_at?: string;
};

export function useCreateKbWithResources() {
  const { setKbId } = useAppContext();

  return useMutation({
    mutationFn: async ({
      connectionId,
      resourceIds,      // Drive IDs (resource_id) from children endpoint
      indexingParams,   // optional
      orgId,            // needed for sync
    }: {
      connectionId: string;
      resourceIds: string[];
      indexingParams?: IndexingParams;
      orgId: string;
    }): Promise<CreateKbResponse> => {
      
    
      if (!connectionId) throw new Error("Missing connectionId");
      if (!orgId) throw new Error("Missing orgId");
      if (!resourceIds?.length) throw new Error("No resources selected");

      // remove duplicates
      const uniqueIds = Array.from(new Set(resourceIds));

      // create KB with the selected resources
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

      // trigger sync
      const syncRes = await fetch(
        `/api/stackai/kb/sync/trigger/${kb.knowledge_base_id}/${orgId}`
      );
      if (!syncRes.ok) {
        const txt = await syncRes.text().catch(() => "");
        throw new Error(`KB sync trigger failed (${syncRes.status}) ${txt}`);
      }

      return kb;
    },

    onSuccess: (kb) => {  
        setKbId(kb.knowledge_base_id);
    },
  });
}
