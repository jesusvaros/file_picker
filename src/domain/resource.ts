export type Resource = {
  resource_id: string;
  inode_type: "directory" | "file";
  inode_path: {
    path: string;
  };
  created_at?: string;
  modified_at?: string;
};

export type SelectedResource = {
  resource_id: string;
  inode_type: string;
  path: string;
};
