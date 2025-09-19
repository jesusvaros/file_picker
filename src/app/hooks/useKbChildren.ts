// hooks/useKbChildren.ts
"use client";
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

export function useKbChildren({kbId, currentResourcePath = "/", page}: {kbId: string | null, currentResourcePath?: string, page?: string | null}) {
  const key = ["kb-children", kbId, currentResourcePath, page];

  return useQuery<Paginated<KBItem>>({
    queryKey: key,
    enabled: Boolean(kbId),
    queryFn: async () => {
      const searchParams = new URLSearchParams({ resource_path: currentResourcePath});
      if (page) searchParams.set("cursor", page);
      const res = await fetch(`/api/stackai/kb/${kbId}/children?${searchParams}`);
      if (!res.ok) throw new Error("Failed to load KB files");
      return res.json();
    },
  });
}
