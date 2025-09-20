"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Paginated, Resource } from "../api/stackai/utils";
import { collator } from "../hooks/useGlobalLoadedSearch";
import { queryKeyBase_children } from "./useChildrenSoftDelete";
import { type SortDirection, type SortKey } from "./useSortState";

function getName(resource: Resource): string {
  return (
    resource.inode_path?.path?.split("/").filter(Boolean).pop() ??
    resource.inode_path?.path ??
    ""
  );
}

function sortResources(
  resources: Resource[],
  sortKey: SortKey,
  sortDirection: SortDirection,
): Resource[] {
  return [...resources].sort((a, b) => {
    let comparison = 0;

    if (sortKey === "name") {
      comparison = collator.compare(getName(a), getName(b));
    } else if (sortKey === "date") {
      // Use modified_at first, then created_at as fallback
      const dateA = new Date(a.modified_at || a.created_at || 0).getTime();
      const dateB = new Date(b.modified_at || b.created_at || 0).getTime();
      comparison = dateA - dateB;
    }

    return sortDirection === "desc" ? -comparison : comparison;
  });
}

export function useChildren(params: {
  connectionId?: string;
  currentResourceId?: string;
  page: string | null;
  enabled?: boolean;
  sortKey?: SortKey;
  sortDirection?: SortDirection;
}) {
  const {
    connectionId,
    currentResourceId,
    page,
    enabled = true,
    sortKey = "name",
    sortDirection = "asc",
  } = params;

  const key = [queryKeyBase_children, connectionId, currentResourceId, page];

  return useQuery<Paginated<Resource>>({
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
    select: (data) => {
      if (typeof window === "undefined") return data;

      try {
        const hiddenRaw = localStorage.getItem(
          `connection_hidden_ids:${connectionId}`,
        );
        const hiddenIds: string[] = hiddenRaw ? JSON.parse(hiddenRaw) : [];
        const hidden = new Set(hiddenIds);
        //filter out hidden resources
        const filteredData = data.data.filter(
          (i) => !hidden.has(i.resource_id),
        );
        const sortedData = sortResources(filteredData, sortKey, sortDirection);

        return {
          ...data,
          data: sortedData,
        };
      } catch {
        return data;
      }
    },
    placeholderData: keepPreviousData,
  });
}
