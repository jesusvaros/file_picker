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
  return useQuery({
    queryKey: ["connections"],
    queryFn: async () => {
      const response = await fetch("/api/stackai/connections");
      if (!response.ok) throw new Error("Error fetching connections");
      return (await response.json()) as StackConnection[];
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
