import type { Resource } from "@/domain/resource";

/**
 * Returns the display name for a resource based on its inode path.
 */
export function getResourceName(resource: Pick<Resource, "inode_path">): string {
  return (
    resource.inode_path?.path?.split("/").filter(Boolean).pop() ??
    resource.inode_path?.path ??
    ""
  );
}
