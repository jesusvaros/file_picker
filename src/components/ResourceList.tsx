"use client";

import { type Resource } from "@/app/api/stackai/utils";
import { useConnectionSoftDelete } from "@/app/hooks/useChildrenSoftDelete";
import { useCreateKbWithResources } from "@/app/hooks/useCreateKbWithResources";
import { useKbChildren } from "@/app/hooks/useKbChildren";
import { useKbDeleteResource } from "@/app/hooks/useKbDeleteResource";
import { Skeleton } from "@/components/ui/skeleton";
import { ResourceItem } from "./ResourceItem";
import { ResourceListHeader } from "./ResourceListHeader";
import { useResourceSelection } from "./hooks/useResourceSelection";

export function ResourceList({
  items,
  isPending,
  error,
  page,
  onOpenFolder,
  connectionId,
  orgId,
  breadcrumbs,
}: {
  items: Resource[];
  isPending: boolean;
  error: unknown;
  page: string|null;
  onOpenFolder: (id: string, label: string) => void;
  connectionId: string;
  orgId: string;
  breadcrumbs: { id: string; label: string }[];
}) {
  const currentResourceId = breadcrumbs[breadcrumbs.length - 1]?.id;
  const currentResourcePath = breadcrumbs[breadcrumbs.length - 1]?.label;

  // Hooks
  const { mutate: deleteResource } = useKbDeleteResource({ resourceId: currentResourceId, page });
  const { mutate: createKbwithResources, error: indexError, isPending: isCreatingKb } = useCreateKbWithResources();
  const { data: childrenKb } = useKbChildren({ currentResourcePath, page });

  const { mutate: softDelete } = useConnectionSoftDelete({
    connectionId,
    currentResourceId,
    page,
  });

  // Selection logic
  const {
    selectedResources,
    isSelectionMode,
    selectedItems,
    unselectedItems,
    toggleSelected,
    handleStartIndexing,
    handleCancelSelection,
    handleIndexComplete,
  } = useResourceSelection({ items, childrenKb });

  const onIndexClick = () => {
    if (!selectedResources.length) return;
    createKbwithResources({
      connectionId,
      selectionResources: selectedResources,
      orgId,
    });
    handleIndexComplete();
  };
      
  if (isPending)
    return (
      <div className="rounded border ">
        <ul className="divide-y">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="flex items-center justify-between gap-3 p-3">
              <div className="flex items-center gap-3">
                <Skeleton className="size-6 rounded-md" />
                <Skeleton className="h-4 w-56" />
              </div>
              <Skeleton className="h-6 w-16" />
            </li>
          ))}
        </ul>
      </div>
    );
  
  if (error)
    return (
      <div className="rounded border p-4 text-red-600">
        Error: {String((error as Error)?.message ?? error)}
      </div>
    );

  return (
    <div className="rounded border">
      <ResourceListHeader
        isSelectionMode={isSelectionMode}
        itemsCount={items.length}
        selectedCount={selectedResources.length}
        indexError={indexError}
        isCreatingKb={isCreatingKb}
        onStartIndexing={handleStartIndexing}
        onCancelSelection={handleCancelSelection}
        onIndexClick={onIndexClick}
      />
      
      <ul className="divide-y">
        {/* Show selected items first when in selection mode */}
        {isSelectionMode && selectedItems.length > 0 && (
          <>
            <li className="p-2 bg-blue-50 text-sm font-medium text-blue-700">
              Selected Items ({selectedItems.length})
            </li>
            {selectedItems.map(item => (
              <ResourceItem
                key={`selected-${item.resource_id}`}
                item={item}
                showCheckbox={true}
                isSelected={true}
                childrenKb={childrenKb}
                onToggleSelected={toggleSelected}
                onOpenFolder={onOpenFolder}
                onDeleteResource={deleteResource}
                onSoftDelete={softDelete}
              />
            ))}
            {unselectedItems.length > 0 && (
              <li className="p-2 bg-gray-50 text-sm font-medium text-gray-700">
                Other Items
              </li>
            )}
          </>
        )}
        
        {/* Show all items or remaining unselected items */}
        {(isSelectionMode ? unselectedItems : items).map(item => (
          <ResourceItem
            key={item.resource_id}
            item={item}
            showCheckbox={isSelectionMode}
            isSelected={selectedResources.some(selected => selected.resource_id === item.resource_id)}
            childrenKb={childrenKb}
            onToggleSelected={toggleSelected}
            onOpenFolder={onOpenFolder}
            onDeleteResource={deleteResource}
            onSoftDelete={softDelete}
          />
        ))}
        
        {!items.length && (
          <li className="p-4 opacity-70">No resources found</li>
        )}
      </ul>
    </div>
  );
}

