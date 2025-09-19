"use client";

import { type Resource } from "@/app/api/stackai/utils";
import { useConnectionSoftDelete } from "@/app/hooks/useChildrenSoftDelete";
import { useCreateKbWithResources } from "@/app/hooks/useCreateKbWithResources";
import { useKbChildren } from "@/app/hooks/useKbChildren";
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
}: {
  items: Resource[];
  isPending: boolean;
  error: unknown;
  page: string|null;
  connectionId: string;
  orgId: string;
}) {

  const { data: childrenKb } = useKbChildren({ page, resourcePath: '/' });
  const { mutate: softDelete } = useConnectionSoftDelete({
    connectionId,
    page,
  });
  const { mutate: createKbwithResources, error: indexError, isPending: isCreatingKb } = useCreateKbWithResources();

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
      selectionResources: resourcesToSend,
      orgId,
    });
    handleIndexComplete();
  };
      
  if (isPending)
    return (
      <div className="h-full flex flex-col">
        {/* Header skeleton */}
        <div className="flex items-center justify-between p-3 mb-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        
        {/* Full page skeleton items */}
        <div className="flex-1 space-y-1">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-3 p-3 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <Skeleton className="size-5 rounded" />
                <Skeleton className="h-4 w-64" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-16 rounded" />
                <Skeleton className="h-4 w-4 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  
  if (error)
    return (
      <div className="p-4 text-red-600">
        Error: {String((error as Error)?.message ?? error)}
      </div>
    );

  return (
    <div>
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
      
      <ul>
        {items.map(item => (
          <ResourceAccordion
            key={item.resource_id}
            item={item}
            showCheckbox={isSelectionMode}
            isSelected={isItemSelected(item.resource_id)}
            childrenKb={childrenKb}
            onToggleSelected={toggleSelected}
            onSoftDelete={softDelete}
            selectedResources={selectedResources}
            connectionId={connectionId}
            registerItems={registerItems}
            isItemSelected={isItemSelected}
            parentResourcePath={'/'}
          />
        ))}
        
        {!items.length && (
          <li className="p-4 opacity-70">No resources found</li>
        )}
      </ul>
    </div>
  );
}

