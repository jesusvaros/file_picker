// hooks/useKbChildren.ts
"use client";
import { useAppContext } from "@/app/providers";
import { useQuery } from "@tanstack/react-query";

export type KBItem = {
  resource_id: string;
  inode_type: "file" | "directory";
  inode_path: { path: string };
  status?: "pending" | "indexed" | "failed";
  modified_at?: string;
};

export type Paginated<T> = {
  data: T[];
  next_cursor?: string | null;
  current_cursor?: string | null;
};

export function useKbChildren({ currentResourcePath = "/", page}: {currentResourcePath?: string, page?: string | null}) {
  const { kbId: kbIdCtx } = useAppContext();
  const key = ["kb-children", kbIdCtx, currentResourcePath, page];

  return useQuery<Paginated<KBItem>>({
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
