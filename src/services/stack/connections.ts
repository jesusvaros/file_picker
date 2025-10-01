import type { StackConnection } from "@/domain/connection";
import { stackRequest } from "./client";

export async function fetchStackConnections(): Promise<StackConnection[]> {
  return stackRequest<StackConnection[]>(
    `/connections?connection_provider=gdrive&limit=10`,
    { method: "GET" },
  );
}
