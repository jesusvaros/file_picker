import type { Paginated } from "@/domain/pagination";
import type { Resource, SelectedResource } from "@/domain/resource";
import { useCallback, useMemo, useState } from "react";

interface UseSelectionEffectsProps {
  items: Resource[];
  childrenKb?: Paginated<Resource>;
}

export function useSelectionEffects({
  items,
  childrenKb,
}: UseSelectionEffectsProps) {
  const [allAvailableItems, setAllAvailableItems] = useState<
    Map<string, Resource>
  >(new Map());

  // Calculate indexed resources (already indexed items from KB) - these are the default selections
  const indexedResources = useMemo<SelectedResource[]>(() => {
    if (!childrenKb?.data || !items?.length) {
      return [];
    }
    const indexedPaths = new Set(childrenKb.data.map((i) => i.inode_path.path));
    return items
      .filter((it) => indexedPaths.has(it.inode_path.path))
      .map((it) => ({
        resource_id: it.resource_id,
        inode_type: it.inode_type,
        path: it.inode_path.path,
      }));
  }, [childrenKb?.data, items]);

  // Create available items map from current items
  const availableItemsMap = useMemo(() => {
    const map = new Map(allAvailableItems);
    items.forEach((item) => {
      map.set(item.resource_id, item);
    });
    return map;
  }, [items, allAvailableItems]);

  // Register items as they become available (from accordion expansions)
  const registerItems = useCallback((newItems: Resource[]) => {
    setAllAvailableItems((prev) => {
      const updated = new Map(prev);
      newItems.forEach((item) => {
        updated.set(item.resource_id, item);
      });
      return updated;
    });
  }, []);

  return {
    indexedResources,
    availableItemsMap,
    registerItems,
  };
}
