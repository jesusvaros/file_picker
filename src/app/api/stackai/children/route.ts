import { NextRequest, NextResponse } from "next/server";

import { fetchConnectionChildren } from "@/services/stack/resources";

export async function GET(req: NextRequest) {
  const connectionId = req.nextUrl.searchParams.get("connectionId");
  const resourceId = req.nextUrl.searchParams.get("resourceId");
  const page = req.nextUrl.searchParams.get("page");

  if (!connectionId) {
    return NextResponse.json(
      { error: "connectionId is required" },
      { status: 400 },
    );
  }

  const data = await fetchConnectionChildren(connectionId, {
    resourceId: resourceId ?? undefined,
    cursor: page,
  });
  return NextResponse.json(data);
}
