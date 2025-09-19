"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Paginated, Resource } from "../api/stackai/utils";
import { queryKeyBase_children } from "./useChildrenSoftDelete";

export function useChildren(params: {
  connectionId?: string;
  currentResourceId?: string;
  page: string | null;
}) {
  const { connectionId, currentResourceId, page } = params;
  const key = [queryKeyBase_children, connectionId, currentResourceId, page];

  return useQuery<Paginated<Resource>>({
    enabled: Boolean(connectionId),
    queryKey: key,
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (connectionId) searchParams.set("connectionId", connectionId);
      if (currentResourceId) searchParams.set("resourceId", currentResourceId);
      if (page) searchParams.set("page", page);
      
      const response = await fetch(`/api/stackai/children?${searchParams.toString()}`);
      if (!response.ok) throw new Error("Error fetching children");

      // filter out hidden resources
      const hiddenRaw = localStorage.getItem(`connection_hidden_ids:${connectionId}`);
      const hiddenIds: string[] = hiddenRaw ? JSON.parse(hiddenRaw) : [];
      const hidden = new Set(hiddenIds);

      const data = (await response.json()) as Paginated<Resource>;

      return {
        ...data,
        data: data.data.filter((i) => !hidden.has(i.resource_id)),
      };
    },
    placeholderData: keepPreviousData,
  });
}