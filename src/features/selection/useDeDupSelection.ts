import type { Resource, SelectedResource } from "@/domain/resource";
import { useCallback } from "react";
import { toast } from "sonner";

interface UseDeDupSelectionProps {
  availableItemsMap: Map<string, Resource>;
  selectedResources: SelectedResource[];
  setSelectedResources: (updater: (prev: SelectedResource[]) => SelectedResource[]) => void;
}

export function useDeDupSelection({
  availableItemsMap,
  selectedResources,
  setSelectedResources,
}: UseDeDupSelectionProps) {
  const toggleSelected = useCallback(
    (id: string) => {
      setSelectedResources((prev) => {
        const item = availableItemsMap.get(id);
        if (!item) {
          toast.error("Unable to locate resource for selection");
          return prev;
        }

        const isSelected = prev.some((x) => x.resource_id === id);
        const newItem = {
          resource_id: item.resource_id,
          inode_type: item.inode_type,
          path: item.inode_path.path,
        };

        return isSelected
          ? prev.filter((x) => x.resource_id !== id)
          : [...prev, newItem];
      });
    },
    [availableItemsMap, setSelectedResources],
  );

  const getResourcesForBackend = useCallback(() => {
    return selectedResources.filter((selected) => {
      if (selected.inode_type === "file") return true;

      // Only include directories that aren't children of other selected directories
      return !selectedResources.some(
        (other) =>
          other.resource_id !== selected.resource_id &&
          other.inode_type === "directory" &&
          selected.path.startsWith(`${other.path}/`),
      );
    });
  }, [selectedResources]);

  return {
    toggleSelected,
    getResourcesForBackend,
  };
}
