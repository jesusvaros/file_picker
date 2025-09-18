"use client";

import { Button } from "@/components/ui/button";

export type ResourceItem = {
  resource_id: string;
  inode_type: "directory" | "file";
  inode_path: { path: string };
};

export function ResourceList({
  items,
  isPending,
  error,
  onOpenFolder,
}: {
  items: ResourceItem[];
  isPending: boolean;
  error: unknown;
  onOpenFolder: (id: string, label: string) => void;
}) {
  if (isPending)
    return <div className="rounded border p-4">Loading resources…</div>;
  if (error)
    return (
      <div className="rounded border p-4 text-red-600">
        Error: {String((error as Error)?.message ?? error)}
      </div>
    );

  return (
    <div className="rounded border">
      <ul className="divide-y">
        {items.map(({ resource_id, inode_type, inode_path }) => (
          <li
            key={resource_id}
            className="hover:bg-muted/40 flex items-center justify-between p-3"
          >
            <div className="flex items-center gap-2">
              <span>{inode_type === "directory" ? "📁" : "📄"}</span>
              <span className="font-medium">{inode_path.path}</span>
            </div>

            {inode_type === "directory" ? (
              <Button
                variant="link"
                size="sm"
                className="px-0 text-blue-600"
                onClick={() => onOpenFolder(resource_id, inode_path.path)}
              >
                Open
              </Button>
            ) : (
              <span className="text-xs opacity-60">File</span>
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
