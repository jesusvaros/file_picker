import { useState, useEffect, useCallback } from "react";
import type { Resource, Paginated } from "@/app/api/stackai/utils";

interface SelectedResource {
  resource_id: string;
  inode_type: string;
  path: string;
}

interface UseNestedResourceSelectionProps {
  items: Resource[];
  childrenKb?: Paginated<Resource>;
}

export function useNestedResourceSelection({ items, childrenKb }: UseNestedResourceSelectionProps) {
  const [selectedResources, setSelectedResources] = useState<SelectedResource[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [allAvailableItems, setAllAvailableItems] = useState<Map<string, Resource>>(new Map());

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

  // Register items as they become available (from accordion expansions)
  const registerItems = useCallback((newItems: Resource[]) => {
    setAllAvailableItems(prev => {
      const updated = new Map(prev);
      newItems.forEach(item => {
        updated.set(item.resource_id, item);
      });
      return updated;
    });
  }, []);

  // Initialize with root items
  useEffect(() => {
    registerItems(items);
  }, [items, registerItems]);

  // Helper functions for better readability
  const removeDirectoryAndChildren = useCallback((directoryItem: Resource, selectedItems: SelectedResource[]) => {
    return selectedItems.filter((x) => {
      if (x.resource_id === directoryItem.resource_id) return false; // Remove the directory itself
      // Remove children (items whose path starts with this directory's path)
      return !x.path.startsWith(directoryItem.inode_path.path + "/");
    });
  }, []);

  const removeFileAndCleanupParents = useCallback((fileId: string, selectedItems: SelectedResource[]) => {
    // First remove the file
    const withoutFile = selectedItems.filter((x) => x.resource_id !== fileId);
    
    // Then remove any parent directories that no longer have selected children
    return withoutFile.filter((selected) => {
      if (selected.inode_type !== "directory") return true;
      
      // Check if this directory still has selected children
      const hasSelectedChildren = withoutFile.some((child) => 
        child.resource_id !== selected.resource_id && 
        child.path.startsWith(selected.path + "/")
      );
      
      return hasSelectedChildren;
    });
  }, []);

  const addItemToSelection = useCallback((item: Resource, selectedItems: SelectedResource[]) => {
    const newItem = {
      resource_id: item.resource_id,
      inode_type: item.inode_type,
      path: item.inode_path.path,
    };

    let newSelection = [...selectedItems, newItem];

    // If it's a directory, also add all visible children for UI feedback
    // (Backend will handle the actual cascade, but UI should show children as selected)
    if (item.inode_type === "directory") {
      const childrenToAdd: SelectedResource[] = [];
      
      // Find all items that are children of this directory
      allAvailableItems.forEach((availableItem) => {
        if (availableItem.inode_path.path.startsWith(item.inode_path.path + "/")) {
          // Don't add if already selected
          const alreadySelected = newSelection.some(s => s.resource_id === availableItem.resource_id);
          if (!alreadySelected) {
            childrenToAdd.push({
              resource_id: availableItem.resource_id,
              inode_type: availableItem.inode_type,
              path: availableItem.inode_path.path,
            });
          }
        }
      });
      
      newSelection = [...newSelection, ...childrenToAdd];
    }

    return newSelection;
  }, [allAvailableItems]);

  const toggleSelected = useCallback((id: string) => {
    setSelectedResources((prev) => {
      // Find the item in our registry
      const item = allAvailableItems.get(id);
      if (!item) return prev; // safety: if item not found, don't add incomplete entry

      const exists = prev.some((x) => x.resource_id === id);
      
      if (exists) {
        // Removing an item
        if (item.inode_type === "directory") {
          return removeDirectoryAndChildren(item, prev);
        } else {
          return removeFileAndCleanupParents(id, prev);
        }
      } else {
        // Adding an item
        return addItemToSelection(item, prev);
      }
    });
  }, [allAvailableItems, removeDirectoryAndChildren, removeFileAndCleanupParents, addItemToSelection]);

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

  // Check if an item is selected
  const isItemSelected = useCallback((resourceId: string) => {
    return selectedResources.some(selected => selected.resource_id === resourceId);
  }, [selectedResources]);

  // Get only the resources that should be sent to the backend (parent directories only, not children)
  const getResourcesForBackend = useCallback(() => {
    return selectedResources.filter(selected => {
      // If it's a file, always include it
      if (selected.inode_type === "file") return true;
      
      // If it's a directory, only include it if it's not a child of another selected directory
      const isChildOfSelectedDirectory = selectedResources.some(other => 
        other.resource_id !== selected.resource_id &&
        other.inode_type === "directory" &&
        selected.path.startsWith(other.path + "/")
      );
      
      return !isChildOfSelectedDirectory;
    });
  }, [selectedResources]);

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
