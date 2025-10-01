import type { Organization } from "@/domain/organization";
import { stackRequest } from "./client";

export async function fetchCurrentOrganization(): Promise<Organization> {
  return stackRequest<Organization>(`/organizations/me/current`, {
    method: "GET",
  });
}
