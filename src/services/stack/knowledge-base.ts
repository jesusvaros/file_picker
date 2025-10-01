import type {
  CreateKnowledgeBaseResponse,
  IndexingParams,
  KnowledgeBaseSummary,
} from "@/domain/knowledge-base";
import { stackRequest } from "./client";

export type CreateKnowledgeBasePayload = {
  connection_id: string;
  connection_source_ids: string[];
  indexing_params: IndexingParams;
  org_level_role?: string | null;
  cron_job_id?: string | null;
};

export async function fetchKnowledgeBases(
  searchParams?: URLSearchParams,
): Promise<KnowledgeBaseSummary[]> {
  const qs = searchParams?.toString() ?? "";
  const path = `/knowledge_bases${qs ? `?${qs}` : ""}`;
  return stackRequest<KnowledgeBaseSummary[]>(path, { method: "GET" });
}

export async function createKnowledgeBase(
  payload: CreateKnowledgeBasePayload,
): Promise<CreateKnowledgeBaseResponse> {
  return stackRequest<CreateKnowledgeBaseResponse>(`/knowledge_bases`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
