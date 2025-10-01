"use client";

import { ExplorerToolbar } from "@/features/explorer/ExplorerToolbar";
import { ExplorerTree } from "@/features/explorer/ExplorerTree";
import { useExplorer } from "@/hooks/useExplorer";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchResults } from "@/components/SearchResults";
import { Pager } from "@/components/Pager";

export type ExplorerViewProps = {
  connectionId: string;
  orgId: string;
  page: string | null;
  onPageChange: (page: string | null) => void;
};

export function ExplorerView({
  connectionId,
  orgId,
  page,
  onPageChange,
}: ExplorerViewProps) {
  const explorer = useExplorer({ connectionId, orgId, page });
  const { query, displayItems, isSearchMode, search, selection, sort, toolbarState } = explorer;
  const { mutate: softDelete } = explorer.mutations.softDelete;

  if (query.isPending) {
    return (
      <div className="flex h-full flex-col">
        <div className="mb-4 flex items-center justify-between p-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
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
  }

  if (query.error) {
    return (
      <div className="p-4 text-red-600">
        Error: {String((query.error as Error)?.message ?? query.error)}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <ExplorerToolbar
        state={toolbarState}
        onSearchChange={search.setQuery}
        onSortClick={sort.cycleSortState}
        onStartIndexing={explorer.actions.handleStartIndexing}
        onCancelSelection={explorer.actions.handleCancelSelection}
        onIndexClick={explorer.actions.handleIndexSelection}
      />

      {isSearchMode ? (
        <SearchResults
          searchResults={search.searchResults}
          searchQuery={search.query}
          softDelete={({ resourceId }) => softDelete({ resourceId })}
        />
      ) : (
        <ExplorerTree
          items={displayItems}
          selection={selection}
          childrenKb={explorer.kbChildren}
          connectionId={connectionId}
          softDelete={softDelete}
          sortState={sort.sortState}
        />
      )}

      <Pager
        page={page}
        nextPage={query.data?.next_cursor ?? null}
        onReset={() => onPageChange(null)}
        onNext={(cursor) => onPageChange(cursor)}
      />
    </div>
  );
}
