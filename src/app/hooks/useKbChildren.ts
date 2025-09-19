"use client";
import { useAppContext } from "@/app/providers";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Paginated, Resource } from "../api/stackai/utils";

export function useKbChildren({
  currentResourcePath = "/",
  page,
}: {
  currentResourcePath?: string;
  page?: string | null;
}) {
  const { kbId: kbIdCtx } = useAppContext();
  const qc = useQueryClient();

  const liveKey = ["kb-children", kbIdCtx, currentResourcePath, page];
  const stagingKey = ["kb-children:staging"];

  // live KB (fetches when kbId exists)
  const live = useQuery<Paginated<Resource>, Error, Paginated<Resource>>({
    queryKey: liveKey,
    enabled: Boolean(kbIdCtx),
    queryFn: async () => {
      const sp = new URLSearchParams({ resource_path: currentResourcePath });
      if (page) sp.set("cursor", page);
      const res = await fetch(`/api/stackai/kb/${kbIdCtx}/children?` + sp);
      if (!res.ok) throw new Error("Failed to load KB files");
      qc.removeQueries({ queryKey: stagingKey });
      return res.json();
    },
    staleTime: 10_000,
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
