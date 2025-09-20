import { type Resource } from "@/app/api/stackai/utils";
import { format, parseISO } from "date-fns";
import { FileIcon } from "./FileIcon";

interface SearchResultsProps {
  searchResults: Resource[];
  searchQuery: string;
  softDelete: ({ resourceId }: { resourceId: string }) => void;
}

export function SearchResults({
  searchResults,
  searchQuery,
  softDelete,
}: SearchResultsProps) {
  return (
    <ul className="space-y-1">
      {searchResults.map((item: Resource) => {
        const path = item.inode_path?.path ?? "";
        const name = path.split("/").filter(Boolean).pop() ?? path;
        return (
          <li key={item.resource_id} className="flex items-center gap-3 p-3 hover:bg-muted/40 rounded-md">
            <FileIcon 
              isDirectory={item.inode_type === "directory"}
              onDelete={() => softDelete({resourceId: item.resource_id})}
            />
            <div className="min-w-0 flex-1">
              <div className="font-medium text-sm truncate">{name}</div>
              <div className="text-xs text-muted-foreground truncate">{path}</div>
              {item.modified_at && (
                <div className="text-xs text-muted-foreground">
                  Modified: {format(parseISO(item.modified_at), "PP")}
                </div>
              )}
            </div>
            <div className="text-xs text-muted-foreground capitalize">
              {item.inode_type}
            </div>
          </li>
        );
      })}
      {searchResults.length === 0 && searchQuery && (
        <li className="p-4 opacity-70 text-center">No matches found in loaded items</li>
      )}
    </ul>
  );
}
