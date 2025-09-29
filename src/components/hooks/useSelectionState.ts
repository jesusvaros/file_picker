import type { SelectedResource } from "@/app/api/stackai/utils";
import { useCallback, useState } from "react";

interface UseSelectionStateProps {
  indexedResources: SelectedResource[];
}

export function useSelectionState({ indexedResources }: UseSelectionStateProps) {
  const [selectedResources, setSelectedResources] = useState<SelectedResource[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  const handleStartIndexing = useCallback(() => {
    setIsSelectionMode(true);
    // Initialize with indexed items as default selections
    if (!hasInitialized) {
      setSelectedResources(indexedResources);
      setHasInitialized(true);
    }
  }, [hasInitialized, indexedResources]);

  const handleCancelSelection = useCallback(() => {
    setIsSelectionMode(false);
    // Reset to only indexed items (revert any changes)
    setSelectedResources(indexedResources);
    setHasInitialized(false);
  }, [indexedResources]);

  const handleIndexComplete = useCallback(() => {
    setIsSelectionMode(false);
    setSelectedResources([]);
    setHasInitialized(false);
  }, []);

  const isItemSelected = useCallback(
    (resourceId: string) => {
      return selectedResources.some(
        (selected) => selected.resource_id === resourceId,
      );
    },
    [selectedResources],
  );

  return {
    selectedResources,
    setSelectedResources,
    isSelectionMode,
    hasInitialized,
    handleStartIndexing,
    handleCancelSelection,
    handleIndexComplete,
    isItemSelected,
  };
}
