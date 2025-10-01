import type { Resource } from "@/domain/resource";
import type { SortDirection, SortKey } from "@/hooks/useSortState";

import { getResourceName } from "./resource-path";

export const resourceCollator = new Intl.Collator(undefined, {
  sensitivity: "base",
  numeric: true,
});

export function sortResources(
  resources: Resource[],
  sortKey: SortKey,
  sortDirection: SortDirection,
): Resource[] {
  return [...resources].sort((a, b) => {
    let comparison = 0;

    if (sortKey === "name") {
      comparison = resourceCollator.compare(
        getResourceName(a),
        getResourceName(b),
      );
    } else if (sortKey === "date") {
      const dateA = new Date(a.modified_at || a.created_at || 0).getTime();
      const dateB = new Date(b.modified_at || b.created_at || 0).getTime();
      comparison = dateA - dateB;
    }

    return sortDirection === "desc" ? -comparison : comparison;
  });
}
