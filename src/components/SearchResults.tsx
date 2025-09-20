import type { Resource } from "@/app/api/stackai/utils";
import { getResourceName } from "@/app/api/stackai/utils";
import { FileIcon } from "./FileIcon";
import { format, parseISO } from "date-fns";

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
        const name = getResourceName(item);
        return (
          <li
            key={item.resource_id}
            className="hover:bg-muted/40 flex items-center gap-3 rounded-md p-3"
          >
            <FileIcon
              isDirectory={item.inode_type === "directory"}
              onDelete={() => softDelete({ resourceId: item.resource_id })}
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{name}</div>
              <div className="text-muted-foreground truncate text-xs">
                {path}
              </div>
              {item.modified_at && (
                <div className="text-muted-foreground text-xs">
                  Modified: {format(parseISO(item.modified_at), "PP")}
                </div>
              )}
            </div>
            <div className="text-muted-foreground text-xs capitalize">
              {item.inode_type}
            </div>
          </li>
        );
      })}
      {searchResults.length === 0 && searchQuery && (
        <li className="p-4 text-center opacity-70">
          No matches found in loaded items
        </li>
      )}
    </ul>
  );
}
