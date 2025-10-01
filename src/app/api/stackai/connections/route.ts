import { NextResponse } from "next/server";

import { fetchStackConnections } from "@/services/stack/connections";

export async function GET() {
  const data = await fetchStackConnections();
  return NextResponse.json(data);
}
