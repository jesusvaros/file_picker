import { type Paginated, type Resource } from "@/app/api/stackai/utils";
import { useChildren } from "@/app/hooks/useChildren";
import { useKbChildren } from "@/app/hooks/useKbChildren";
import { useKbDeleteResource } from "@/app/hooks/useKbDeleteResource";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { ResourceItem } from "./ResourceItem";

export interface ResourceAccordionProps {
  item: Resource;
  showCheckbox: boolean;
  isSelected: boolean;
  childrenKb?: Paginated<Resource>;
  onToggleSelected: (id: string) => void;
  onSoftDelete: ({resourceId, parentResourceId}: {resourceId: string, parentResourceId: string}) => void;
  level?: number;
  selectedResources?: Array<{ resource_id: string; inode_type: string; path: string }>;
  connectionId?: string;
  registerItems?: (items: Resource[]) => void;
  isItemSelected?: (id: string) => boolean;
  parentResourceId?: string;
  parentResourcePath?: string;
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
}: ResourceAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { resource_id, inode_type, inode_path } = item;

  // Only fetch children when accordion is opened and it's a directory
  const shouldFetchChildren = isOpen && inode_type === "directory";
  const { mutate: deleteResource } = useKbDeleteResource({ page: null, resource_path: inode_path.path, parentResourcePath: parentResourcePath ?? "" });
  
  const { 
    data: directoryChildren, 
    isPending: isLoadingChildren,
    error: childrenError 
  } = useChildren({
    connectionId: connectionId,
    currentResourceId: resource_id,
    page: null,
    enabled: shouldFetchChildren, // Only fetch when we actually need it
  });

  const { data: directoryChildrenKb } = useKbChildren({ page: null, resourcePath: inode_path.path, enabled: shouldFetchChildren });

  // Register items when they load
  useEffect(() => {
    if (directoryChildren?.data && registerItems) {
      registerItems(directoryChildren.data);
    }
  }, [directoryChildren?.data, registerItems]);

  // Auto-select newly loaded children if parent is selected
  useEffect(() => {
    if (directoryChildren?.data && isSelected && inode_type === "directory" && isItemSelected) {
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
  }, [directoryChildren?.data, isSelected, inode_type, isItemSelected, onToggleSelected]);

  // For files, just render the ResourceItem
  if (inode_type === "file") {
    return (
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
    );
  }

  // For directories, render as accordion
  return (
    <div className={`${level > 0 ? 'ml-4 border-l border-gray-200 pl-4' : ''}`}>
      <Accordion type="single" collapsible>
        <AccordionItem value={resource_id} className="border-none" onClick={() => setIsOpen(!isOpen)}>
          <div className="flex items-center">
            {/* Directory item with checkbox */}
            <div className="flex-1 flex items-center gap-2 p-3 hover:bg-muted/40">
              {showCheckbox && (
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => {
                    onToggleSelected(resource_id);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              <span>📁</span>
              <span className="font-medium">{inode_path.path}</span>
              
              {/* Show indexed badge if applicable */}
              {childrenKb?.data.some((i) => i.inode_path.path === inode_path.path) && (
                <div className="relative inline-flex h-6 items-center overflow-hidden group">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteResource();
                    }}
                    className="relative h-6 px-2 py-0 flex items-center justify-center bg-blue-500 text-white text-xs rounded transition-colors duration-300 group-hover:bg-red-500 cursor-pointer"
                  >
                    <span className="block transition-transform duration-300 group-hover:-translate-y-full">
                      Indexed
                    </span>
                    <span className="pb-0.5 absolute top-full block text-center transition-transform duration-300 group-hover:-translate-y-full">
                      De-index
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Accordion trigger */}
            <AccordionTrigger 
              className="hover:no-underline p-2"
            >
              <span className="sr-only">Toggle {inode_path.path}</span>
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
              <div className="ml-4 p-2 text-red-600 text-sm">
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
                    isSelected={isItemSelected ? isItemSelected(childItem.resource_id) : selectedResources.some(selected => selected.resource_id === childItem.resource_id)}
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
                  />
                ))}
              </div>
            )}
            
            {directoryChildren?.data && directoryChildren.data.length === 0 && (
              <div className="ml-4 p-2 text-gray-500 text-sm">
                Empty directory
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
