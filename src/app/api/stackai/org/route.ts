import { NextResponse } from "next/server";

import { fetchCurrentOrganization } from "@/services/stack/org";

export async function GET() {
  const organization = await fetchCurrentOrganization();
  return NextResponse.json(organization);
}
