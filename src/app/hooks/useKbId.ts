"use client";

import { useEffect, useState } from "react";

export type CreateKbBody = {
  connection_id: string;
  connection_source_ids: string[];
  indexing_params?: unknown;
  org_level_role?: string | null;
  cron_job_id?: string | null;
};

export function useKbId(createBody: CreateKbBody | null) {
  const [kbId, setKbId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // If we don't have the necessary body yet, do nothing for now.
        if (!createBody) {
          setLoading(false);
          return;
        }
        // 1) reuse if it already exists
        const existing = localStorage.getItem("knowledge_base_id");
        if (existing) {
          if (!cancelled) setKbId(existing);
          setLoading(false);
          return;
        }

        // 2) create once
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
  }, [createBody ? JSON.stringify(createBody) : null]);

  return { kbId, loading, error };
}
