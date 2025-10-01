import { useState } from "react";

import { type SortOption } from "@/hooks/useSortState";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ActionButtons } from "@/components/ActionButtons";
import { SearchControl } from "@/components/SearchControl";
import { SortButton } from "@/components/SortButton";

export type ExplorerToolbarState = {
  isSelectionMode: boolean;
  itemsCount: number;
  selectedCount: number;
  indexError?: Error | null;
  isCreatingKb: boolean;
  searchQuery: string;
  totalSearched?: number;
  currentSortOption: SortOption;
  isSearchMode: boolean;
};

export type ExplorerToolbarProps = {
  state: ExplorerToolbarState;
  onSearchChange: (query: string) => void;
  onSortClick: () => void;
  onStartIndexing?: () => void;
  onCancelSelection?: () => void;
  onIndexClick?: () => void;
};

export function ExplorerToolbar({
  state,
  onSearchChange,
  onSortClick,
  onStartIndexing,
  onCancelSelection,
  onIndexClick,
}: ExplorerToolbarProps) {
  const {
    isSelectionMode,
    itemsCount,
    selectedCount,
    indexError,
    isCreatingKb,
    searchQuery,
    totalSearched,
    currentSortOption,
    isSearchMode,
  } = state;

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const isSearchActive = isSearchMode || isSearchFocused;

  const showSelectionActions = Boolean(
    onCancelSelection && onIndexClick && state.isSelectionMode,
  );

  const showIndexingEntry = Boolean(onStartIndexing);

  return (
    <TooltipProvider>
      <div className="p-3">
        <div className="flex items-center justify-between">
          {!isSelectionMode ? (
            <>
              <div className="text-sm opacity-70">
                {searchQuery ? (
                  <>
                    {itemsCount} results{" "}
                    {totalSearched &&
                      `(searched ${totalSearched} loaded items)`}
                  </>
                ) : (
                  `${itemsCount} items`
                )}
              </div>

              <div className="flex items-center gap-2">
                <SearchControl
                  searchQuery={searchQuery}
                  onSearchChange={onSearchChange}
                  isSearchActive={isSearchActive}
                  onFocusChange={setIsSearchFocused}
                />

                <SortButton
                  currentSortOption={currentSortOption}
                  onSortClick={onSortClick}
                  isSearchActive={isSearchActive}
                />

                {showIndexingEntry && (
                  <ActionButtons
                    onStartIndexing={onStartIndexing!}
                    isSearchActive={isSearchActive}
                  />
                )}
              </div>
            </>
          ) : (
            <>
              <div className="text-sm opacity-70">
                Selected: {selectedCount}
              </div>
              {showSelectionActions && (
                <div className="flex items-center gap-2">
                  {indexError && (
                    <span className="text-xs text-red-600">
                      {indexError.message}
                    </span>
                  )}
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={onCancelSelection!}
                    className="cursor-pointer rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    size="lg"
                    disabled={!selectedCount || isCreatingKb}
                    onClick={onIndexClick!}
                    className="cursor-pointer rounded-xl bg-blue-500 px-4 py-2 hover:bg-blue-600"
                  >
                    Index selected ({selectedCount})
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
