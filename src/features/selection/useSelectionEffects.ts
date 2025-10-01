import type { Paginated } from "@/domain/pagination";
import type { Resource, SelectedResource } from "@/domain/resource";
import { useCallback, useMemo, useRef } from "react";

interface UseSelectionEffectsProps {
  items: Resource[];
  childrenKb?: Paginated<Resource>;
}

export function useSelectionEffects({
  items,
  childrenKb,
}: UseSelectionEffectsProps) {
  const allAvailableItemsRef = useRef<Map<string, Resource>>(new Map());

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
  const getAvailableItemsMap = useCallback(() => {
    const map = new Map(allAvailableItemsRef.current);
    items.forEach((item) => {
      map.set(item.resource_id, item);
    });
    allAvailableItemsRef.current = map;
    return map;
  }, [items]);

  // Register items as they become available (from accordion expansions)
  const registerItems = useCallback((newItems: Resource[]) => {
    const updated = new Map(allAvailableItemsRef.current);
    newItems.forEach((item) => {
      updated.set(item.resource_id, item);
    });
    allAvailableItemsRef.current = updated;
  }, []);

  return {
    indexedResources,
    getAvailableItemsMap,
    registerItems,
  };
}
