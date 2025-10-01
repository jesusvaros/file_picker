"use client";

import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";

import type { Paginated } from "@/domain/pagination";
import type { Resource } from "@/domain/resource";
import { getResourceName } from "@/lib/resource-path";

import { queryKeyBaseChildren } from "./useConnectionSoftDelete";

export function useExplorerSearch(query: string) {
  const queryClient = useQueryClient();

  return useMemo(() => {
    const searchTerm = query.trim().toLowerCase();

    // Get all children queries currently in cache
    const entries = queryClient.getQueriesData<Paginated<Resource>>({
      queryKey: [queryKeyBaseChildren],
    });

    // Flatten all data arrays and dedupe by resource_id
    const seen = new Set<string>();
    const allResources: Resource[] = entries
      .map(([, data]) => data?.data ?? [])
      .flat()
      .filter((resource) => {
        if (seen.has(resource.resource_id)) {
          return false;
        }
        seen.add(resource.resource_id);
        return true;
      });

    if (!searchTerm) {
      return { results: [], totalSearched: allResources.length };
    }

    // Filter by name match
    const filtered = allResources.filter((resource) =>
      getResourceName(resource)
        .toLowerCase()
        .includes(searchTerm),
    );

    return { results: filtered, totalSearched: allResources.length };
  }, [queryClient, query]);
}
