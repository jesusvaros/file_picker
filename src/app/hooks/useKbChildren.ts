"use client";
import { useAppContext } from "@/app/providers";
import { useQuery } from "@tanstack/react-query";
import { Paginated, Resource } from "../api/stackai/utils";


export function useKbChildren({ currentResourcePath = "/", page}: {currentResourcePath?: string, page?: string | null}) {
  const { kbId: kbIdCtx } = useAppContext();
  const key = ["kb-children", kbIdCtx, currentResourcePath, page];

  return useQuery<Paginated<Resource>>({
    queryKey: key,
    enabled: Boolean(kbIdCtx),
    queryFn: async () => {
      const searchParams = new URLSearchParams({ resource_path: currentResourcePath});
      if (page) searchParams.set("cursor", page);
      const res = await fetch(`/api/stackai/kb/${kbIdCtx}/children?${searchParams}`);
      if (!res.ok) throw new Error("Failed to load KB files");
      return res.json();
    },
  });
}
