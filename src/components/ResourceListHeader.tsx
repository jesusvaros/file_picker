import { type SortOption } from "@/app/hooks/useSortState";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ActionButtons } from "./ActionButtons";
import { SearchControl } from "./SearchControl";
import { SortButton } from "./SortButton";
import * as React from "react";

interface ResourceListHeaderProps {
  isSelectionMode: boolean;
  itemsCount: number;
  selectedCount: number;
  indexError?: Error | null;
  isCreatingKb: boolean;
  onStartIndexing: () => void;
  onCancelSelection: () => void;
  onIndexClick: () => void;
  // New search and sort props
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentSortOption: SortOption;
  onSortClick: () => void;
  totalSearched?: number;
}

export function ResourceListHeader({
  isSelectionMode,
  itemsCount,
  selectedCount,
  indexError,
  isCreatingKb,
  onStartIndexing,
  onCancelSelection,
  onIndexClick,
  searchQuery,
  onSearchChange,
  currentSortOption,
  onSortClick,
  totalSearched,
}: ResourceListHeaderProps) {
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);
  const isSearchActive = searchQuery.trim().length > 0 || isSearchFocused;

  return (
    <TooltipProvider>
      <div className="p-3">
        {/* Combined Status and Controls Bar */}
        <div className="flex items-center justify-between">
        {!isSelectionMode ? (
          <>
            {/* Left side: Status only */}
            <div className="text-sm opacity-70">
              {searchQuery ? (
                <>
                  {itemsCount} results {totalSearched && `(searched ${totalSearched} loaded items)`}
                </>
              ) : (
                `${itemsCount} items`
              )}
            </div>
            
            {/* Right side: Search + Sort + Start Indexing */}
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
              
              <ActionButtons
                onStartIndexing={onStartIndexing}
                isSearchActive={isSearchActive}
              />
            </div>
          </>
        ) : (
          <>
            <div className="text-sm opacity-70">
              Selected: {selectedCount}
            </div>
            <div className="flex items-center gap-2">
              {indexError && (
                <span className="text-xs text-red-600">
                  {indexError.message}
                </span>
              )}
              <Button
                variant="outline"
                size="lg"
                onClick={onCancelSelection}
                className="rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="lg"
                disabled={!selectedCount || isCreatingKb}
                onClick={onIndexClick}
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-xl cursor-pointer"
              >
                Index selected ({selectedCount})
              </Button>
            </div>
          </>
        )}
      </div>
      </div>
    </TooltipProvider>
  );
}
