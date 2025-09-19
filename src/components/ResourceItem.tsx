import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { format, parseISO } from "date-fns";
import { DeleteAction } from "./DeleteAction";
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
        {/* Delete action for both files and folders */}
        <DeleteAction
          onDelete={() => {
            console.log('ResourceItem delete called', { resource_id, parentResourceId, inode_type });
            onSoftDelete({resourceId: resource_id, parentResourceId});
          }}
          isDirectory={isDirectory(inode_type)}
        />
        
        {isDirectory(inode_type) ? (
          <Button
            variant="link"
            size="sm"
            className="px-0 text-blue-600 cursor-pointer"
          >
            Open
          </Button>
        ) : (
          <span className="text-xs opacity-60">File</span>
        )}
      </div>
    </li>
  );
}
