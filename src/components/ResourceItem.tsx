import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { format, parseISO } from "date-fns";
import { ResourceAccordionProps } from "./ResourceAccordion";


const isDirectory = (inode_type: "directory" | "file") => {
  return inode_type === "directory";
};

type ItemsProps = ResourceAccordionProps & {
  onDeleteResource: () => void;
}


export function ResourceItem({
  item,
  showCheckbox,
  isSelected,
  childrenKb,
  onToggleSelected,
  onDeleteResource,
  onSoftDelete,
  parentResourceId
}: ItemsProps) {
  const { resource_id, inode_type, inode_path, modified_at } = item;
  const isIndexed = childrenKb?.data.some((i) => i.inode_path.path === inode_path.path);

  console.log(item)

  return (
    <li
      key={resource_id}
      className={`hover:bg-muted/40 ${isDirectory(inode_type) ? "cursor-pointer" : ""} flex items-center justify-between p-3 ${
        isSelected ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        {showCheckbox && (
          <Checkbox
            className="cursor-pointer"
            checked={isSelected}
            onCheckedChange={() => onToggleSelected(resource_id)}
            onClick={(e) => e.stopPropagation()}
          />
        )}
        <span>{isDirectory(inode_type) ? "📁" : "📄"}</span>
        <span className="font-medium">{inode_path.path}</span>
        
        {isIndexed && (
          <div className="relative inline-flex h-6 items-center overflow-hidden group">
            <Badge
              onClick={(e) => {
                e.stopPropagation();
                onDeleteResource();
              }}
              variant="default"
              className="relative h-6 px-2 py-0 flex items-center justify-center bg-blue-500 transition-colors duration-300 group-hover:bg-red-500"
            >
              <span className="block transition-transform duration-300 group-hover:-translate-y-full">
                Indexed
              </span>
              <span className="pb-0.5 absolute top-full block text-center transition-transform duration-300 group-hover:-translate-y-full">
                De-index
              </span>
            </Badge>
          </div>
        )}
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
              variant="outline"
              size="sm"
              className="p-2 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onSoftDelete({resourceId: resource_id, parentResourceId: parentResourceId ?? ''});
              }}
            >
              🗑️
            </Button>
            <span className="text-xs opacity-60">File</span>
          </div>
        )}
      </div>
    </li>
  );
}
