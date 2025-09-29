import type { Paginated, Resource } from "@/app/api/stackai/utils";
import { useSelectionState } from "./useSelectionState";
import { useDeDupSelection } from "./useDeDupSelection";
import { useSelectionEffects } from "./useSelectionEffects";

interface UseNestedResourceSelectionProps {
  items: Resource[];
  childrenKb?: Paginated<Resource>;
}

export function useNestedResourceSelection({
  items,
  childrenKb,
}: UseNestedResourceSelectionProps) {
  // Handle side effects and data processing
  const { indexedResources, availableItemsMap, registerItems } = useSelectionEffects({
    items,
    childrenKb,
  });

  // Handle selection state and mode management
  const {
    selectedResources,
    setSelectedResources,
    isSelectionMode,
    handleStartIndexing,
    handleCancelSelection,
    handleIndexComplete,
    isItemSelected,
  } = useSelectionState({ indexedResources });

  // Handle deduplication and complex selection logic
  const { toggleSelected, getResourcesForBackend } = useDeDupSelection({
    availableItemsMap,
    selectedResources,
    setSelectedResources,
  });

  return {
    selectedResources,
    isSelectionMode,
    toggleSelected,
    handleStartIndexing,
    handleCancelSelection,
    handleIndexComplete,
    registerItems,
    isItemSelected,
    getResourcesForBackend,
  };
}
