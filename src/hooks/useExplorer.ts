"use client";

import { useMemo, useState } from "react";

import type { Paginated } from "@/domain/pagination";
import type { Resource } from "@/domain/resource";

import { useConnectionChildren } from "./useConnectionChildren";
import { useConnectionSoftDelete } from "./useConnectionSoftDelete";
import { useKbMutations } from "./useKbMutations";
import { useExplorerSearch } from "./useExplorerSearch";
import { useKnowledgeBaseChildren } from "./useKnowledgeBaseChildren";
import { useResourceSelection } from "@/features/selection/useResourceSelection";
import { useSortState } from "./useSortState";

export type UseExplorerParams = {
  connectionId: string;
  orgId: string;
  page: string | null;
};

export type ExplorerSelection = ReturnType<typeof useResourceSelection>;

export function useExplorer({
  connectionId,
  orgId,
  page,
}: UseExplorerParams) {
  const [searchQuery, setSearchQuery] = useState("");

  const { sortState, currentOption, cycleSortState } = useSortState();

  const { results: searchResults, totalSearched } = useExplorerSearch(searchQuery);

  const childrenQuery = useConnectionChildren({
    connectionId,
    page,
    sortKey: sortState.key,
    sortDirection: sortState.direction,
  });

  const items = childrenQuery.data?.data ?? [];
  const isSearchMode = searchQuery.trim().length > 0;
  const displayItems = isSearchMode ? searchResults : items;

  const kbChildren = useKnowledgeBaseChildren({
    page,
    resourcePath: "/",
  });

  const selection = useResourceSelection({
    items: displayItems,
    childrenKb: kbChildren.data as Paginated<Resource> | undefined,
  });

  const softDelete = useConnectionSoftDelete({ connectionId, page });
  const kbMutations = useKbMutations();

  const handleIndexSelection = () => {
    const resourcesToSend = selection.getResourcesForBackend();
    if (!resourcesToSend.length) return;

    kbMutations.create.mutate({
      connectionId,
      selectionResources: resourcesToSend,
      orgId,
    });
    selection.handleIndexComplete();
  };

  const indexError = useMemo(() => {
    if (kbMutations.create.error instanceof Error) {
      return kbMutations.create.error;
    }
    if (!kbMutations.create.error) return null;
    return new Error(String(kbMutations.create.error));
  }, [kbMutations.create.error]);

  const toolbarState = useMemo(() => {
    return {
      isSelectionMode: selection.isSelectionMode,
      itemsCount: displayItems.length,
      selectedCount: selection.selectedResources.length,
      indexError,
      isCreatingKb: kbMutations.create.isPending,
      searchQuery,
      totalSearched,
      currentSortOption: currentOption,
      isSearchMode,
    };
  }, [
    selection.isSelectionMode,
    selection.selectedResources.length,
    indexError,
    kbMutations.create.isPending,
    searchQuery,
    displayItems.length,
    totalSearched,
    currentOption,
    isSearchMode,
  ]);

  return {
    query: childrenQuery,
    items,
    displayItems,
    kbChildren: kbChildren.data,
    kbChildrenQuery: kbChildren,
    isSearchMode,
    selection,
    sort: {
      sortState,
      currentOption,
      cycleSortState,
    },
    search: {
      query: searchQuery,
      setQuery: setSearchQuery,
      totalSearched,
      searchResults,
    },
    toolbarState,
    actions: {
      handleIndexSelection,
      handleStartIndexing: selection.handleStartIndexing,
      handleCancelSelection: selection.handleCancelSelection,
    },
    mutations: {
      create: kbMutations.create,
      softDelete,
    },
  };
}
