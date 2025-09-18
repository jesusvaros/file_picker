"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Paginated, Resource } from "../api/stackai/utils";

export type StackConnection = {
  connection_id: string;
  name: string;
  created_at: string;
  updated_at: string;
};


export function useConnections(options?: { enabled?: boolean }) {
  const hasStored =
    typeof window !== "undefined" && Boolean(localStorage.getItem("connectionId"));
  const enabled = (options?.enabled ?? true) && !hasStored;

  return useQuery<StackConnection[]>({
    queryKey: ["connections"],
    queryFn: async () => {
      const response = await fetch("/api/stackai/connections");
      if (!response.ok) throw new Error("Error fetching connections");
      const data = (await response.json()) as StackConnection[];
      const id = data?.[0]?.connection_id;
      if (id) {
        try {
          localStorage.setItem("connectionId", id);
        } catch {}
      }
      return data;
    },
    staleTime: 60_000,
    enabled,
  });
}

export function useChildren(params: {
  connectionId?: string;
  resourceId?: string;
  page?: string | null;
}) {
  const { connectionId, resourceId, page } = params;

  return useQuery<Paginated<Resource>>({
    enabled: Boolean(connectionId),
    queryKey: ["children", connectionId, resourceId ?? "root", page ?? ""],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (connectionId) searchParams.set("connectionId", connectionId);
      if (resourceId) searchParams.set("resourceId", resourceId);
      if (page) searchParams.set("page", page);
      
      const response = await fetch(`/api/stackai/children?${searchParams.toString()}`);
      if (!response.ok) throw new Error("Error fetching children");
      return (await response.json()) as Paginated<Resource>;
    },
    placeholderData: keepPreviousData,
  });
}

export function useConnectionId() {
  const stored =
    typeof window !== "undefined" ? localStorage.getItem("connectionId") : null;
  const { data, isPending, error } = useConnections({ enabled: !stored });
  const connectionId = stored ?? data?.[0]?.connection_id ?? null;
  return {
    connectionId,
    isPending: !stored && isPending,
    error,
  };
}
