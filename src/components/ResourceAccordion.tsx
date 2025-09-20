import { type Paginated, type Resource, type SelectedResource } from "@/app/api/stackai/utils";
import { useChildren } from "@/app/hooks/useChildren";
import { useKbChildren } from "@/app/hooks/useKbChildren";
import { useKbDeleteResource } from "@/app/hooks/useKbDeleteResource";
import { type SortDirection, type SortKey } from "@/app/hooks/useSortState";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { useEffect, useMemo } from "react";
import { FileIcon } from "./FileIcon";
import { IndexedBadge } from "./IndexedBadge";
import { ResourceItem } from "./ResourceItem";

export interface ResourceAccordionProps {
  item: Resource;
  showCheckbox: boolean;
  isSelected: boolean;
  childrenKb?: Paginated<Resource>;
  onToggleSelected: (id: string) => void;
  onSoftDelete: ({
    resourceId,
    parentResourceId,
  }: {
    resourceId: string;
    parentResourceId?: string;
  }) => void;
  level?: number;
  selectedResources?: SelectedResource[];
  connectionId?: string;
  registerItems?: (items: Resource[]) => void;
  isItemSelected?: (id: string) => boolean;
  parentResourceId?: string;
  parentResourcePath?: string;
  sortKey?: SortKey;
  sortDirection?: SortDirection;
}

export function ResourceAccordion({
  item,
  showCheckbox,
  isSelected,
  childrenKb,
  onToggleSelected,
  onSoftDelete,
  level = 0,
  selectedResources = [],
  connectionId,
  registerItems,
  isItemSelected,
  parentResourceId,
  parentResourcePath,
  sortKey = "name",
  sortDirection = "asc",
}: ResourceAccordionProps) {
  const { resource_id, inode_type, inode_path } = item;

  // Memoize KB item lookup to avoid expensive array operations on every render
  const kbItem = useMemo(() => {
    return childrenKb?.data.find((i) => i.inode_path.path === inode_path.path);
  }, [childrenKb?.data, inode_path.path]);

  // Memoize indexed status check
  const isIndexed = useMemo(() => {
    return Boolean(kbItem);
  }, [kbItem]);

  // Only fetch children when it's a directory (accordion will handle lazy loading)
  const shouldFetchChildren = inode_type === "directory";
  const { mutate: deleteResource } = useKbDeleteResource({
    page: null,
    resource_path: inode_path.path,
    parentResourcePath: parentResourcePath ?? "",
  });

  const {
    data: directoryChildren,
    isPending: isLoadingChildren,
    error: childrenError,
  } = useChildren({
    connectionId: connectionId,
    currentResourceId: resource_id,
    page: null,
    enabled: shouldFetchChildren, // Only fetch when we actually need it
    sortKey,
    sortDirection,
  });

  const { data: directoryChildrenKb } = useKbChildren({
    page: null,
    resourcePath: inode_path.path,
    enabled: shouldFetchChildren,
  });

  // Register items when they load
  useEffect(() => {
    if (directoryChildren?.data && registerItems) {
      registerItems(directoryChildren.data);
    }
  }, [directoryChildren?.data, registerItems]);

  // Auto-select newly loaded children if parent is selected
  useEffect(() => {
    if (
      directoryChildren?.data &&
      isSelected &&
      inode_type === "directory" &&
      isItemSelected
    ) {
      // Use setTimeout to avoid state update conflicts
      setTimeout(() => {
        directoryChildren.data.forEach((child) => {
          // Check if child is not already selected
          if (!isItemSelected(child.resource_id)) {
            onToggleSelected(child.resource_id);
          }
        });
      }, 0);
    }
  }, [
    directoryChildren?.data,
    isSelected,
    inode_type,
    isItemSelected,
    onToggleSelected,
  ]);

  // For files, just render the ResourceItem with same indentation as directories
  if (inode_type === "file") {
    return (
      <div
        className={`${level > 0 ? "ml-4 border-l border-gray-200 pl-4" : ""}`}
      >
        <ResourceItem
          item={item}
          showCheckbox={showCheckbox}
          isSelected={isSelected}
          childrenKb={childrenKb}
          onToggleSelected={onToggleSelected}
          onDeleteResource={deleteResource}
          onSoftDelete={onSoftDelete}
          parentResourceId={parentResourceId}
        />
      </div>
    );
  }

  // For directories, render as accordion
  return (
    <div className={`${level > 0 ? "ml-4 border-l border-gray-200 pl-4" : ""}`}>
      <Accordion type="single" collapsible>
        <AccordionItem value={resource_id} className="border-none">
          <div className="hover:bg-muted/40 flex w-full items-center">
            <div className="flex items-center gap-2 p-3">
              {showCheckbox && (
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => {
                    onToggleSelected(resource_id);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              <FileIcon
                isDirectory={true}
                onDelete={() => {
                  onSoftDelete({ resourceId: resource_id, parentResourceId });
                }}
              />
            </div>

            <AccordionTrigger className="w-full flex-1 justify-between p-3 pl-0 hover:no-underline">
              <div className="flex w-full items-center gap-2">
                <span className="text-base font-medium">{inode_path.path}</span>

                {isIndexed && (
                  <IndexedBadge onDelete={deleteResource} isDirectory={true} />
                )}

                {kbItem?.modified_at && (
                  <span className="text-xs opacity-60">
                    {format(parseISO(kbItem.modified_at), "PP")}
                  </span>
                )}
              </div>
            </AccordionTrigger>
          </div>

          <AccordionContent>
            {isLoadingChildren && shouldFetchChildren && (
              <div className="ml-4 space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <Skeleton className="size-4 rounded" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            )}

            {childrenError && (
              <div className="ml-4 p-2 text-sm text-red-600">
                Error loading directory contents
              </div>
            )}

            {directoryChildren?.data && directoryChildren.data.length > 0 && (
              <div className="space-y-1">
                {directoryChildren.data.map((childItem: Resource) => (
                  <ResourceAccordion
                    key={childItem.resource_id}
                    item={childItem}
                    showCheckbox={showCheckbox}
                    isSelected={
                      isItemSelected
                        ? isItemSelected(childItem.resource_id)
                        : selectedResources.some(
                            (selected) =>
                              selected.resource_id === childItem.resource_id,
                          )
                    }
                    childrenKb={directoryChildrenKb}
                    onToggleSelected={onToggleSelected}
                    onSoftDelete={onSoftDelete}
                    level={level + 1}
                    selectedResources={selectedResources}
                    connectionId={connectionId}
                    registerItems={registerItems}
                    isItemSelected={isItemSelected}
                    parentResourceId={item.resource_id}
                    parentResourcePath={item.inode_path.path}
                    sortKey={sortKey}
                    sortDirection={sortDirection}
                  />
                ))}
              </div>
            )}

            {directoryChildren?.data && directoryChildren.data.length === 0 && (
              <div className="ml-4 p-2 text-sm text-gray-500">
                Empty directory
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
