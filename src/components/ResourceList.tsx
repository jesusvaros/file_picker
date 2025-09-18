"use client";

import { type Resource } from "@/app/api/stackai/utils";
import { useKnowledgeBaseDeleteResource } from "@/app/hooks/useKnowledgeBaseDeleteResource";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";

export function ResourceList({
  items,
  isPending,
  error,
  parentResourcePath,
  page,
  onOpenFolder,
  kbId,
}: {
  items: Resource[];
  isPending: boolean;
  error: unknown;
  parentResourcePath: string;
  page: string|null;
  onOpenFolder: (id: string, label: string) => void;
  kbId: string | null;
}) {

  const { mutate: deleteResource, isPending: isDeleting } =
    useKnowledgeBaseDeleteResource({ knowledgeBaseId: kbId, parentResourcePath, page });


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

  
  
  const isDirectory = (inode_type: "directory" | "file") => {
    return inode_type === "directory";
  };
  


  return (
    <div className="rounded border">
      <ul className="divide-y">
        {items.map(({ resource_id, inode_type, inode_path, modified_at}) => (
          <li
            key={resource_id}
            className={`hover:bg-muted/40 ${isDirectory(inode_type) ? "cursor-pointer" : ""} flex items-center justify-between p-3`}
            onClick={isDirectory(inode_type) ? () => onOpenFolder(resource_id, inode_path.path) : undefined}
          >
            <div className="flex items-center gap-2">
              <span>{isDirectory(inode_type) ? "📁" : "📄"}</span>
              <span className="font-medium">{inode_path.path}</span>
              {modified_at && (
                <span className="text-xs opacity-60">
                  {format(parseISO(modified_at), "PP")}
                </span>
              )}
            </div>

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
                disabled={isDeleting || !kbId}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteResource(inode_path.path);
                }}
              >
                {isDeleting ? "Deleting…" : "Delete"}
              </Button>

              <span className="text-xs opacity-60">File</span>
              </div>
            )}
          </li>
        ))}
        {!items.length && (
          <li className="p-4 opacity-70"> No resources found</li>
        )}
      </ul>
    </div>
  );
}

