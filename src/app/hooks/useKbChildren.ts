"use client";
import { useAppContext } from "@/app/providers";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Paginated, Resource } from "../api/stackai/utils";

export function useKbChildren({
  page,
  enabled = true,
  resourcePath,
}: {
  page?: string | null;
  enabled?: boolean;
  resourcePath: string;
}) {
  const { kbId: kbIdCtx } = useAppContext();
  const qc = useQueryClient();

  const liveKey = ["kb-children", kbIdCtx, resourcePath, page];
  const stagingKey = ["kb-children:staging"];

  // live KB (fetches when kbId exists)
  const live = useQuery<Paginated<Resource>, Error, Paginated<Resource>>({
    queryKey: liveKey,
    enabled: Boolean(kbIdCtx) && enabled,
    queryFn: async () => {
      const sp = new URLSearchParams({ resource_path: resourcePath }); 
      if (page) sp.set("cursor", page);
      const res = await fetch(`/api/stackai/kb/${kbIdCtx}/children?` + sp);
      
      // Handle path not found errors (500/404)
      if (!res.ok) {
        if (res.status === 500 || res.status === 404) {
          return {
            data: [],
            next_cursor: null,
            current_cursor: null,
          };
        }
        throw new Error("Failed to load KB files");
      }
      // remove staging data
      qc.removeQueries({ queryKey: stagingKey });
      return res.json();
    },
    staleTime: 30_000,
    retry: (failureCount, error) => {
      // Don't retry on path not found errors (400/404)
      if (error?.message?.includes('Path error') || 
          error?.message?.includes('does not exist')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), 
  });

  const staging = useQuery<Paginated<Resource>, Error, Paginated<Resource>>({
    queryKey: stagingKey,
    queryFn: async () =>
      (qc.getQueryData(stagingKey) as Paginated<Resource>) ?? {
        data: [],
        next_cursor: null,
        current_cursor: null,
      },
    staleTime: Infinity,
  });

  const stagingQueryData = qc.getQueryData(stagingKey) as Paginated<Resource> | undefined;
  const hasStagingData = stagingQueryData && stagingQueryData.data.length > 0;
  
  return hasStagingData ? staging : live;
}
