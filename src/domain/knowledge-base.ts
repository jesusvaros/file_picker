export type KnowledgeBaseSummary = {
  knowledge_base_id: string;
  name?: string | null;
  created_at?: string;
  updated_at?: string;
  org_id?: string;
};

export type CreateKnowledgeBaseResponse = {
  knowledge_base_id: string;
  created_at?: string;
};

export type IndexingParams = {
  ocr: boolean;
  unstructured: boolean;
};

export type KnowledgeBaseResourceInput = {
  resource_path: string;
  resource_type: "file" | "directory";
  recursive?: boolean;
};
