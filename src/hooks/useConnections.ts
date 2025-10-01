"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import type { StackConnection } from "@/domain/connection";
import { useRouteState } from "@/hooks/useRouteState";

export function useConnections(options?: { enabled?: boolean }) {
  const [connectionId, setConnectionId] = useRouteState("connectionId");
  const [orgId, setOrgId] = useRouteState("orgId");

  const enabled = (options?.enabled ?? true) && !connectionId;

  const query = useQuery<StackConnection[]>({
    queryKey: ["connections"],
    queryFn: async () => {
      const response = await fetch("/api/stackai/connections");
      if (!response.ok) throw new Error("Error fetching connections");
      return (await response.json()) as StackConnection[];
    },
    staleTime: 60_000,
    enabled,
  });

  useEffect(() => {
    const first = query.data?.[0];
    if (!first) return;

    if (!connectionId) setConnectionId(first.connection_id);
    if (!orgId && first.org_id) setOrgId(first.org_id);
  }, [query.data, connectionId, orgId, setConnectionId, setOrgId]);

  return query;
}

export function useConnectionId() {
  const [connectionId] = useRouteState("connectionId");
  const [orgId] = useRouteState("orgId");

  const { data, isPending, error } = useConnections({
    enabled: !connectionId,
  });

  const fallbackConnectionId = data?.[0]?.connection_id ?? null;
  const fallbackOrgId = data?.[0]?.org_id ?? null;

  return {
    data,
    orgId: orgId ?? fallbackOrgId,
    connectionId: connectionId ?? fallbackConnectionId,
    isPending: !connectionId && isPending,
    error,
  };
}
