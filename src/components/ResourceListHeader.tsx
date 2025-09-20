import { type SortOption } from "@/app/hooks/useSortState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
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
    <div className="space-y-3 p-3">
      {/* Search and Sort Controls */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Input
            placeholder="Search files and folders..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="pr-8"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSearchChange("")}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100 rounded-full"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        {!isSearchActive && (
          <Button
            variant="outline"
            onClick={onSortClick}
            className="flex items-center gap-2 min-w-fit h-8 px-3 text-sm transition-all duration-200"
          >
            <span>{currentSortOption.icon}</span>
            <span className="hidden sm:inline">{currentSortOption.label}</span>
          </Button>
        )}
      </div>

      {/* Status and Action Bar */}
      <div className="flex items-center justify-between">
        {!isSelectionMode ? (
          <>
            <div className="text-sm opacity-70">
              {searchQuery ? (
                <>
                  {itemsCount} results {totalSearched && `(searched ${totalSearched} loaded items)`}
                </>
              ) : (
                `${itemsCount} items`
              )}
            </div>
            {!searchQuery && (
              <Button
                size="lg"
                variant="default"
                onClick={onStartIndexing}
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-xl cursor-pointer"
              >
                Start Indexing
              </Button>
            )}
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
  );
}
