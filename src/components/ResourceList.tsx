"use client";

import { useChildren } from "@/app/hooks/useChildren";
import { useConnectionSoftDelete } from "@/app/hooks/useChildrenSoftDelete";
import { useCreateKbWithResources } from "@/app/hooks/useCreateKbWithResources";
import { useGlobalLoadedSearch } from "@/app/hooks/useGlobalLoadedSearch";
import { useKbChildren } from "@/app/hooks/useKbChildren";
import { useSortState } from "@/app/hooks/useSortState";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Pager } from "./Pager";
import { ResourceAccordion } from "./ResourceAccordion";
import { ResourceListHeader } from "./ResourceListHeader";
import { SearchResults } from "./SearchResults";
import { useNestedResourceSelection } from "./hooks/useNestedResourceSelection";

export function ResourceList({
  page,
  connectionId,
  orgId,
  onPageChange,
}: {
  page: string | null;
  connectionId: string;
  orgId: string;
  onPageChange: (page: string | null) => void;
}) {
  // Search and sort state
  const [searchQuery, setSearchQuery] = useState("");
  const { sortState, currentOption, cycleSortState } = useSortState();
  const { results: searchResults, totalSearched } =
    useGlobalLoadedSearch(searchQuery);

  // Fetch root level data with sort parameters
  const { data, isPending, error } = useChildren({
    connectionId,
    page,
    sortKey: sortState.key,
    sortDirection: sortState.direction,
  });

  const items = data?.data ?? [];

  const { data: childrenKb } = useKbChildren({ page, resourcePath: "/" });
  const { mutate: softDelete } = useConnectionSoftDelete({
    connectionId,
    page,
  });
  const {
    mutate: createKbwithResources,
    error: indexError,
    isPending: isCreatingKb,
  } = useCreateKbWithResources();

  // Determine which items to show and use for selection
  const isSearchMode = searchQuery.trim().length > 0;
  const displayItems = isSearchMode ? searchResults : items;
  const displayItemsCount = displayItems.length;

  // Selection logic
  const {
    selectedResources,
    isSelectionMode,
    toggleSelected,
    handleStartIndexing,
    handleCancelSelection,
    handleIndexComplete,
    registerItems,
    isItemSelected,
    getResourcesForBackend,
  } = useNestedResourceSelection({ items: displayItems, childrenKb });

  const onIndexClick = () => {
    const resourcesToSend = getResourcesForBackend();
    if (!resourcesToSend.length) return;
    createKbwithResources({
      connectionId,
      selectionResources: resourcesToSend,
      orgId,
    });
    handleIndexComplete();
  };

  if (isPending)
    return (
      <div className="flex h-full flex-col">
        {/* Header skeleton */}
        <div className="mb-4 flex items-center justify-between p-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>

        {/* Full page skeleton items */}
        <div className="flex-1 space-y-1">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 p-3 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="size-5 rounded" />
                <Skeleton className="h-4 w-64" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-16 rounded" />
                <Skeleton className="h-4 w-4 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );

  if (error)
    return (
      <div className="p-4 text-red-600">
        Error: {String((error as Error)?.message ?? error)}
      </div>
    );

  return (
    <div>
      <ResourceListHeader
        isSelectionMode={isSelectionMode}
        itemsCount={displayItemsCount}
        selectedCount={selectedResources.length}
        indexError={indexError}
        isCreatingKb={isCreatingKb}
        onStartIndexing={handleStartIndexing}
        onCancelSelection={handleCancelSelection}
        onIndexClick={onIndexClick}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentSortOption={currentOption}
        onSortClick={cycleSortState}
        totalSearched={totalSearched}
      />

      {isSearchMode ? (
        <SearchResults
          searchResults={searchResults}
          searchQuery={searchQuery}
          softDelete={softDelete}
        />
      ) : (
        <ul>
          {items.map((item) => (
            <ResourceAccordion
              key={item.resource_id}
              item={item}
              showCheckbox={isSelectionMode}
              isSelected={isItemSelected(item.resource_id)}
              childrenKb={childrenKb}
              onToggleSelected={toggleSelected}
              onSoftDelete={softDelete}
              selectedResources={selectedResources}
              connectionId={connectionId}
              registerItems={registerItems}
              isItemSelected={isItemSelected}
              parentResourcePath={"/"}
              sortKey={sortState.key}
              sortDirection={sortState.direction}
            />
          ))}

          {!items.length && (
            <li className="p-4 opacity-70">No resources found</li>
          )}
        </ul>
      )}

      <Pager
        page={page}
        nextPage={data?.next_cursor ?? null}
        onReset={() => onPageChange(null)}
        onNext={(cursor) => onPageChange(cursor)}
      />
    </div>
  );
}
