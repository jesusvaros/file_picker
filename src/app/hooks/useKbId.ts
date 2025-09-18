"use client";

import { useEffect, useState } from "react";

export type CreateKbBody = {
  connection_id: string;
  connection_source_ids: string[];
  indexing_params?: unknown;
  org_level_role?: string | null;
  cron_job_id?: string | null;
};

// Upstream list response types
type KnowledgeBase = {
  knowledge_base_id: string;
  connection_id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
  is_empty: boolean;
  total_size: number;
};

type KnowledgeBaseListResponse = {
  admin: KnowledgeBase[];
};

export function useKbId(connectionId: string | null) {
  const [kbId, setKbId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    const createBody: CreateKbBody | null = connectionId
      ? {
          connection_id: connectionId,
          connection_source_ids: [],
          indexing_params: {
            ocr: false,
            unstructured: true,
            embedding_params: { embedding_model: "text-embedding-ada-002", api_key: null },
            chunker_params: { chunk_size: 1500, chunk_overlap: 500, chunker: "sentence" },
          },
          org_level_role: null,
          cron_job_id: null,
        }
      : null;

    async function init() {
      try {
        // 1) reuse if it already exists
        const existing = localStorage.getItem("knowledge_base_id");

        if (existing) {
          if (!cancelled) setKbId(existing);
          setLoading(false);
          return;
        }

        if (!createBody) {
          setLoading(false);
          return;
        }
        // 2) first, try to find an existing KB from backend (optionally filtered by connection_id)
        setLoading(true);
        try {
          const qs = createBody.connection_id
            ? `?connection_id=${encodeURIComponent(createBody.connection_id)}`
            : "";
          const resList = await fetch(`/api/stackai/kb${qs}`);
          if (resList.ok) {
            const json = (await resList.json()) as KnowledgeBaseListResponse;
            const list = Array.isArray(json?.admin) ? json.admin : [];
            const match = createBody.connection_id
              ? list.find((kb) => kb.connection_id === createBody.connection_id)
              : list[0];
            const foundId = match?.knowledge_base_id ?? null;
            if (foundId) {
              localStorage.setItem("knowledge_base_id", foundId);
              if (!cancelled) {
                setKbId(foundId);
                setLoading(false);
              }
              return;
            }
          }
        } catch {
        }

        // 3) create once if none found
        setLoading(true);
        const res = await fetch("/api/stackai/kb", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(createBody),
        });
        if (!res.ok) throw new Error(`KB create failed: ${res.status}`);

        const json = await res.json();
        const id: string = json?.knowledge_base_id ?? json?.id;
        if (!id) throw new Error("KB creation: missing knowledge_base_id");

        localStorage.setItem("knowledge_base_id", id);
        if (!cancelled) setKbId(id);
      } catch (e) {
        if (!cancelled) setError(e as Error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [connectionId]);

  return { kbId, loading, error };
}
