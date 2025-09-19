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
    <div className="flex items-center justify-between p-3">
      {!isSelectionMode ? (
        <>
          <div className="text-sm opacity-70">
            {itemsCount} items
            
          </div>
          <Button
            size="lg"
            variant="default"
            onClick={onStartIndexing}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-xl cursor-pointer"
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
  );
}
