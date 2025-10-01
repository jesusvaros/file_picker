import type { Paginated } from "@/domain/pagination";
import type { Resource } from "@/domain/resource";
import { stackRequest, stackRequestRaw } from "./client";

export type ConnectionChildrenParams = {
  resourceId?: string;
  cursor?: string | null;
};

export async function fetchConnectionChildren(
  connectionId: string,
  params: ConnectionChildrenParams = {},
): Promise<Paginated<Resource>> {
  const search = new URLSearchParams();
  if (params.resourceId) search.set("resource_id", params.resourceId);
  if (params.cursor) search.set("page", params.cursor);

  const path = `/connections/${connectionId}/resources/children${search.toString() ? `?${search}` : ""}`;
  return stackRequest<Paginated<Resource>>(path);
}

export type KnowledgeBaseChildrenParams = {
  resourcePath: string;
  cursor?: string | null;
};

export async function fetchKnowledgeBaseChildren(
  kbId: string,
  params: KnowledgeBaseChildrenParams,
): Promise<Paginated<Resource>> {
  const search = new URLSearchParams({
    resource_path: params.resourcePath,
  });
  if (params.cursor) search.set("cursor", params.cursor);

  const path = `/knowledge_bases/${kbId}/resources/children?${search}`;
  return stackRequest<Paginated<Resource>>(path);
}

export async function deleteKnowledgeBaseResource(
  kbId: string,
  resourcePath: string,
): Promise<void> {
  await stackRequest(
    `/knowledge_bases/${kbId}/resources?resource_path=${encodeURIComponent(resourcePath)}`,
    { method: "DELETE" },
  );
}

export async function addKnowledgeBaseResource(
  kbId: string,
  form: FormData,
): Promise<void> {
  await stackRequest(`/knowledge_bases/${kbId}/resources`, {
    method: "POST",
    body: form,
  });
}

export async function triggerKnowledgeBaseSync(
  kbId: string,
  orgId: string,
): Promise<void> {
  await stackRequestRaw(
    `/knowledge_bases/sync/trigger/${kbId}/${orgId}`,
    { method: "GET" },
  );
}
