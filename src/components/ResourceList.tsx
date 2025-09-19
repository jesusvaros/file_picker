"use client";

import { type Resource } from "@/app/api/stackai/utils";
import { useConnectionSoftDelete } from "@/app/hooks/useChildrenSoftDelete";
import { useCreateKbWithResources } from "@/app/hooks/useCreateKbWithResources";
import { useKbChildren } from "@/app/hooks/useKbChildren";
import { useKbDeleteResource } from "@/app/hooks/useKbDeleteResource";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { useEffect, useState } from "react";

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

  const { mutate: deleteResource } = useKbDeleteResource({ resourceId: currentResourceId, page });
  const { mutate:createKbwithResources, error: indexError,isPending: isCreatingKb } = useCreateKbWithResources();

  const currentResourcePath = breadcrumbs[breadcrumbs.length - 1]?.label;

  const { data: childrenKb } = useKbChildren({currentResourcePath: currentResourcePath , page});

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    setSelectedIds(childrenKb?.data.map((i) => i.resource_id) ?? []);
  }, [childrenKb]);

  const { mutate: softDelete } = useConnectionSoftDelete({
    connectionId,
    currentResourceId: currentResourceId,
    page,
  });
 
  const toggleSelected = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const onIndexClick = () => {
    if (!selectedIds.length) return;
    createKbwithResources({
      connectionId,
      resourceIds: selectedIds,
      orgId,
    });
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

    console.log(childrenKb?.data,items)
  
  
  const isDirectory = (inode_type: "directory" | "file") => {
    return inode_type === "directory";
  };

  //todo animate delete

  return (
    <div className="rounded border">
      <div className="flex items-center justify-between p-3 border-b">
        <div className="text-sm opacity-70">
          Selected: {selectedIds.length}
        </div>
        <div className="flex items-center gap-2">
          {indexError && (
            <span className="text-xs text-red-600">
              {(indexError as Error)?.message}
            </span>
          )}
          <Button
            variant="default"
            size="sm"
            disabled={!selectedIds.length || isCreatingKb}
            onClick={onIndexClick}
          >
            Index selected ({selectedIds.length})
          </Button>
        </div>
      </div>
      <ul className="divide-y">
        {items.map(({ resource_id, inode_type, inode_path, modified_at}) => (
          <li
            key={resource_id}
            className={`hover:bg-muted/40 ${isDirectory(inode_type) ? "cursor-pointer" : ""} flex items-center justify-between p-3`}
            onClick={isDirectory(inode_type) ? () => onOpenFolder(resource_id, inode_path.path) : undefined}
          >
            <div className="flex items-center gap-2">
              <Checkbox
                className="cursor-pointer"
                checked={selectedIds.includes(resource_id)}
                onCheckedChange={() => toggleSelected(resource_id)}
                onClick={(e) => e.stopPropagation()}
              />
              <span>{isDirectory(inode_type) ? "📁" : "📄"}</span>
              {childrenKb?.data.some((i) => i.inode_path.path === inode_path.path) ? 
              <Badge variant="default" className="bg-blue-500">Indexed</Badge> : ""}
              <span className="font-medium">{inode_path.path}</span>
              {modified_at && (
                <span className="text-xs opacity-60">
                  {format(parseISO(modified_at), "PP")}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
            {isDirectory(inode_type) ? (
              <Button
                variant="link"
                size="sm"
                className="px-0 text-blue-600 cursor-pointer"
              >
                Open
              </Button>
              
            ) : (
              <div className="flex items-center gap-2">
              <Button
                variant="link"
                size="sm"
                className="px-0 text-red-600 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  softDelete(resource_id);
                }}
              >
                Delete
              </Button>
              <span className="text-xs opacity-60">File</span>
              </div>
            )}
            </div>
          </li>
        ))}
        {!items.length && (
          <li className="p-4 opacity-70"> No resources found</li>
        )}
      </ul>
    </div>
  );
}

