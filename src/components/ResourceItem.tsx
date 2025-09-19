import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { format, parseISO } from "date-fns";
import { IndexedBadge } from "./IndexedBadge";
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
  const { resource_id, inode_type, inode_path } = item;
  const isIndexed = childrenKb?.data.some((i) => i.inode_path.path === inode_path.path);

  console.log(item)

  return (
    <li
      key={resource_id}
      className={`hover:bg-muted/40 ${isDirectory(inode_type) ? "cursor-pointer" : ""} flex items-center justify-between p-3`}
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
        <span className="font-medium text-base">{inode_path.path}</span>
        
        {isIndexed && (
          <>
            <IndexedBadge onDelete={onDeleteResource} />
            {(() => {
              const kbItem = childrenKb?.data.find((i) => i.inode_path.path === inode_path.path);
              return kbItem?.modified_at && (
                <span className="text-xs opacity-60">
                  {format(parseISO(kbItem.modified_at), "PP")}
                </span>
              );
            })()}
          </>
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
