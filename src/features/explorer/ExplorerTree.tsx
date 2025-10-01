import type { Paginated } from "@/domain/pagination";
import type { Resource, SelectedResource } from "@/domain/resource";
import type { SortState } from "@/hooks/useSortState";
import type { ExplorerSelection } from "@/hooks/useExplorer";

import { ResourceAccordion } from "@/components/ResourceAccordion";

export type ExplorerTreeProps = {
  items: Resource[];
  selection?: ExplorerSelection;
  childrenKb?: Paginated<Resource>;
  connectionId?: string;
  softDelete?: (args: { resourceId: string; parentResourceId?: string }) => void;
  sortState: SortState;
};

export function ExplorerTree({
  items,
  selection,
  childrenKb,
  connectionId,
  softDelete,
  sortState,
}: ExplorerTreeProps) {
  const selectedResources = selection?.selectedResources ?? ([] as SelectedResource[]);
  const isSelectionMode = selection?.isSelectionMode ?? false;
  const isItemSelected = selection?.isItemSelected ?? (() => false);
  const toggleSelected = selection?.toggleSelected ?? (() => undefined);
  const registerItems = selection?.registerItems ?? (() => undefined);

  return (
    <ul>
      {items.map((item) => (
        <ResourceAccordion
          key={item.resource_id}
          item={item}
          showCheckbox={isSelectionMode}
          isSelected={isItemSelected(item.resource_id)}
          childrenKb={childrenKb}
          onToggleSelected={toggleSelected}
          onSoftDelete={softDelete ?? (() => undefined)}
          selectedResources={selectedResources}
          connectionId={connectionId}
          registerItems={registerItems}
          isItemSelected={isItemSelected}
          parentResourcePath={"/"}
          sortKey={sortState.key}
          sortDirection={sortState.direction}
        />
      ))}

      {!items.length && (
        <li className="p-4 opacity-70">No resources found</li>
      )}
    </ul>
  );
}
