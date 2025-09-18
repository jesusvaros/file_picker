"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

export type StackConnection = {
  connection_id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type Resource = {
  resource_id: string;
  inode_type: "directory" | "file";
  inode_path: { path: string };
  updated_at?: string;
  created_at?: string;
  modified_at?: string;
};

export type ChildrenResponse = {
  data: Resource[];
  next_cursor?: string | null;
  current_cursor?: string | null;
};

export function useConnections(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["connections"],
    queryFn: async () => {
      const r = await fetch("/api/stackai/connections");
      if (!r.ok) throw new Error("Error fetching connections");
      return (await r.json()) as StackConnection[];
    },
    staleTime: 60_000,
    enabled: options?.enabled ?? true,
  });
}

export function useChildren(params: {
  connectionId?: string;
  resourceId?: string;
  page?: string | null;
}) {
  const { connectionId, resourceId, page } = params;

  return useQuery({
    enabled: Boolean(connectionId),
    queryKey: ["children", connectionId, resourceId ?? "root", page ?? ""],
    queryFn: async () => {
      const qs = new URLSearchParams();
      if (connectionId) qs.set("connectionId", connectionId);
      if (resourceId) qs.set("resourceId", resourceId);
      if (page) qs.set("page", page);
      const r = await fetch(`/api/stackai/children?${qs.toString()}`);
      if (!r.ok) throw new Error("Error fetching children");
      return (await r.json()) as ChildrenResponse;
    },
    placeholderData: keepPreviousData,
  });
}
