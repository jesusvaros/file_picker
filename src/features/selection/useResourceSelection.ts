import type { Paginated } from "@/domain/pagination";
import type { Resource } from "@/domain/resource";

import { useDeDupSelection } from "./useDeDupSelection";
import { useSelectionEffects } from "./useSelectionEffects";
import { useSelectionState } from "./useSelectionState";

interface UseResourceSelectionProps {
  items: Resource[];
  childrenKb?: Paginated<Resource>;
}

export function useResourceSelection({
  items,
  childrenKb,
}: UseResourceSelectionProps) {
  const { indexedResources, getAvailableItemsMap, registerItems } = useSelectionEffects({
    items,
    childrenKb,
  });

  const {
    selectedResources,
    setSelectedResources,
    isSelectionMode,
    handleStartIndexing,
    handleCancelSelection,
    handleIndexComplete,
    isItemSelected,
  } = useSelectionState({ indexedResources });

  const { toggleSelected, getResourcesForBackend } = useDeDupSelection({
    getAvailableItemsMap,
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
