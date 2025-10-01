import { Checkbox } from "@/components/ui/checkbox";
import { format, parseISO } from "date-fns";
import { useMemo } from "react";
import { FileIcon } from "./FileIcon";
import { IndexedBadge } from "./IndexedBadge";
import { ResourceAccordionProps } from "./ResourceAccordion";

const isDirectory = (inode_type: "directory" | "file") => {
  return inode_type === "directory";
};

type ItemsProps = ResourceAccordionProps & {
  onDeleteResource?: () => void;
};

export function ResourceItem({
  item,
  showCheckbox,
  isSelected,
  childrenKb,
  onToggleSelected,
  onSoftDelete,
  parentResourceId,
  onDeleteResource,
}: ItemsProps) {
  const { resource_id, inode_type, inode_path } = item;
  
  // Memoize KB item lookup to avoid expensive array operations on every render
  const kbItem = useMemo(() => {
    return childrenKb?.data.find((i) => i.inode_path.path === inode_path.path);
  }, [childrenKb?.data, inode_path.path]);

  const isIndexed = Boolean(kbItem);

  return (
    <li
      key={resource_id}
      className={`hover:bg-muted/40 flex items-center justify-between p-3`}
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
        <FileIcon
          isDirectory={isDirectory(inode_type)}
          onDelete={() =>
            onSoftDelete({ resourceId: resource_id, parentResourceId })
          }
        />
        <span className="text-base font-medium">{inode_path.path}</span>

        {isIndexed && (
          <>
            <IndexedBadge onDelete={onDeleteResource} />
            {kbItem?.modified_at && (
              <span className="text-xs opacity-60">
                {format(parseISO(kbItem.modified_at), "PP")}
              </span>
            )}
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs capitalize opacity-60">{inode_type}</span>
      </div>
    </li>
  );
}
