import { Button } from "@/components/ui/button";

interface ResourceListHeaderProps {
  isSelectionMode: boolean;
  itemsCount: number;
  selectedCount: number;
  indexError?: Error | null;
  isCreatingKb: boolean;
  onStartIndexing: () => void;
  onCancelSelection: () => void;
  onIndexClick: () => void;
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
}: ResourceListHeaderProps) {
  return (
    <div className="flex items-center justify-between p-3 border-b">
      {!isSelectionMode ? (
        <>
          <div className="text-sm opacity-70">
            {itemsCount} items
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={onStartIndexing}
          >
            Start Indexing
          </Button>
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
              size="sm"
              onClick={onCancelSelection}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              disabled={!selectedCount || isCreatingKb}
              onClick={onIndexClick}
            >
              Index selected ({selectedCount})
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
