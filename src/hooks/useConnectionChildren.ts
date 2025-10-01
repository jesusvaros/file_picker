"use client";

import { useMemo } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { Paginated } from "@/domain/pagination";
import type { Resource } from "@/domain/resource";
import { sortResources } from "@/lib/resource-sort";
import { useHiddenResources } from "@/hooks/useHiddenResources";
import { queryKeyBaseChildren } from "./useConnectionSoftDelete";
import { type SortDirection, type SortKey } from "./useSortState";

export type UseConnectionChildrenParams = {
  connectionId?: string;
  currentResourceId?: string;
  page: string | null;
  enabled?: boolean;
  sortKey?: SortKey;
  sortDirection?: SortDirection;
};

export function useConnectionChildren(params: UseConnectionChildrenParams) {
  const {
    connectionId,
    currentResourceId,
    page,
    enabled = true,
    sortKey = "name",
    sortDirection = "asc",
  } = params;

  const { hiddenSet } = useHiddenResources(connectionId);

  const key = [queryKeyBaseChildren, connectionId, currentResourceId, page];

  const queryResult = useQuery<Paginated<Resource>>({
    enabled: Boolean(connectionId) && enabled,
    queryKey: key,
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (connectionId) searchParams.set("connectionId", connectionId);
      if (currentResourceId) searchParams.set("resourceId", currentResourceId);
      if (page) searchParams.set("page", page);

      const response = await fetch(
        `/api/stackai/children?${searchParams.toString()}`,
      );
      if (!response.ok) throw new Error("Error fetching children");

      const data = (await response.json()) as Paginated<Resource>;
      return data;
    },
    placeholderData: keepPreviousData,
  });

  const data = useMemo(() => {
    if (!queryResult.data) return queryResult.data;

    const filtered = queryResult.data.data.filter(
      (item) => !hiddenSet.has(item.resource_id),
    );

    return {
      ...queryResult.data,
      data: sortResources(filtered, sortKey, sortDirection),
    };
  }, [queryResult.data, hiddenSet, sortKey, sortDirection]);

  return {
    ...queryResult,
    data,
  };
}
