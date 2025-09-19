import { useState, useEffect } from "react";
import type { Resource, Paginated } from "@/app/api/stackai/utils";

interface SelectedResource {
  resource_id: string;
  inode_type: string;
  path: string;
}

interface UseResourceSelectionProps {
  items: Resource[];
  childrenKb?: Paginated<Resource>;
}

export function useResourceSelection({ items, childrenKb }: UseResourceSelectionProps) {
  const [selectedResources, setSelectedResources] = useState<SelectedResource[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Sync selectedIds with childrenKb (already indexed items)
  useEffect(() => {
    if (!childrenKb?.data || !items?.length) {
      setSelectedResources([]);
      return;
    }
    const indexedPaths = new Set(childrenKb?.data?.map((i) => i.inode_path.path));
    const nextSelected = items
      .filter((it) => indexedPaths.has(it.inode_path.path))
      .map((it) => ({ 
        resource_id: it.resource_id, 
        inode_type: it.inode_type, 
        path: it.inode_path.path 
      }));
    setSelectedResources(nextSelected);
  }, [childrenKb?.data, items]);

  const toggleSelected = (id: string, allItems?: Resource[]) => {
    setSelectedResources((prev) => {
      const exists = prev.some((x) => x.resource_id === id);
      
      // Find the item in the provided items array or fallback to main items
      const searchItems = allItems || items;
      const item = searchItems.find((it) => it.resource_id === id);
      if (!item) return prev; // safety: if item not found, don't add incomplete entry

      if (exists) {
        // Remove the item and any children if it's a directory
        if (item.inode_type === "directory") {
          // Remove this directory and any items that are children of this directory
          return prev.filter((x) => x.resource_id !== id && !x.path.startsWith(item.inode_path.path + "/"));
        } else {
          // Just remove the file
          return prev.filter((x) => x.resource_id !== id);
        }
      } else {
        // Add the item
        const newItem = {
          resource_id: id,
          inode_type: item.inode_type,
          path: item.inode_path.path,
        };

        // If it's a directory, the backend will automatically select all its children (cascade)
        // So we only need to add the directory itself - the backend handles the rest
        return [...prev, newItem];
      }
    });
  };

  const handleStartIndexing = () => {
    setIsSelectionMode(true);
  };

  const handleCancelSelection = () => {
    setIsSelectionMode(false);
    // Only remove non-indexed items from selection
    if (childrenKb?.data) {
      const indexedPaths = new Set(childrenKb.data.map((i) => i.inode_path.path));
      setSelectedResources(prev => 
        prev.filter(selected => indexedPaths.has(selected.path))
      );
    }
  };

  const handleIndexComplete = () => {
    setIsSelectionMode(false);
    setSelectedResources([]);
  };

  // Separate selected and unselected items
  const selectedItems = items.filter(item => 
    selectedResources.some(selected => selected.resource_id === item.resource_id)
  );
  const unselectedItems = items.filter(item => 
    !selectedResources.some(selected => selected.resource_id === item.resource_id)
  );

  return {
    selectedResources,
    isSelectionMode,
    selectedItems,
    unselectedItems,
    toggleSelected,
    handleStartIndexing,
    handleCancelSelection,
    handleIndexComplete,
  };
}
