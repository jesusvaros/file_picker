"use client";

import { type Resource } from "@/app/api/stackai/utils";
import { useConnectionSoftDelete } from "@/app/hooks/useChildrenSoftDelete";
import { useCreateKbWithResources } from "@/app/hooks/useCreateKbWithResources";
import { useKbChildren } from "@/app/hooks/useKbChildren";
import { useKbDeleteResource } from "@/app/hooks/useKbDeleteResource";
import { Skeleton } from "@/components/ui/skeleton";
import { ResourceAccordion } from "./ResourceAccordion";
import { ResourceListHeader } from "./ResourceListHeader";
import { useNestedResourceSelection } from "./hooks/useNestedResourceSelection";

export function ResourceList({
  items,
  isPending,
  error,
  page,
  connectionId,
  orgId,
  breadcrumbs,
}: {
  items: Resource[];
  isPending: boolean;
  error: unknown;
  page: string|null;
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
    toggleSelected,
    handleStartIndexing,
    handleCancelSelection,
    handleIndexComplete,
    registerItems,
    isItemSelected,
    getResourcesForBackend,
  } = useNestedResourceSelection({ items, childrenKb });

  const onIndexClick = () => {
    const resourcesToSend = getResourcesForBackend();
    if (!resourcesToSend.length) return;
    createKbwithResources({
      connectionId,
      selectionResources: resourcesToSend, // Send only parent directories, not children
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
        selectedCount={selectedResources.length} // Show total selected (including children for UI feedback)
        indexError={indexError}
        isCreatingKb={isCreatingKb}
        onStartIndexing={handleStartIndexing}
        onCancelSelection={handleCancelSelection}
        onIndexClick={onIndexClick}
      />
      
      <ul className="divide-y">
        {/* Show all items with proper selection state */}
        {items.map(item => (
          <ResourceAccordion
            key={item.resource_id}
            item={item}
            showCheckbox={isSelectionMode}
            isSelected={isItemSelected(item.resource_id)}
            childrenKb={childrenKb}
            onToggleSelected={toggleSelected}
            onDeleteResource={deleteResource}
            onSoftDelete={softDelete}
            selectedResources={selectedResources}
            connectionId={connectionId}
            registerItems={registerItems}
            isItemSelected={isItemSelected}
          />
        ))}
        
        {!items.length && (
          <li className="p-4 opacity-70">No resources found</li>
        )}
      </ul>
    </div>
  );
}

