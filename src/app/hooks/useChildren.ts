"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Paginated, Resource } from "../api/stackai/utils";
import { useConnections } from "./useConnections";

export function useChildren(params: {
  connectionId?: string;
  resourceId?: string;
  page: string | null;
}) {
  const { connectionId, resourceId, page } = params;

  return useQuery<Paginated<Resource>>({
    enabled: Boolean(connectionId),
    queryKey: ["children", resourceId, page ],
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
  const storedConnectionId =
    typeof window !== "undefined" ? localStorage.getItem("connectionId") : null;
    const storedOrgId =
    typeof window !== "undefined" ? localStorage.getItem("orgId") : null;
  const { data, isPending, error } = useConnections({ enabled: !storedConnectionId });
  const connectionId = storedConnectionId ?? data?.[0]?.connection_id ?? null;
  const orgId = storedOrgId ?? data?.[0]?.org_id ?? null;
  return {
    data,
    orgId,
    connectionId,
    isPending: !storedConnectionId && isPending,
    error,
  };
}
