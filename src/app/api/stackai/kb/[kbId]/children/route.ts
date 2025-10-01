import { NextRequest, NextResponse } from "next/server";

import { fetchKnowledgeBaseChildren } from "@/services/stack/resources";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ kbId: string }> },
) {
  const { kbId } = await params;

  const resource_path = req.nextUrl.searchParams.get("resource_path");
  const cursor = req.nextUrl.searchParams.get("cursor");

  if (!resource_path) {
    return NextResponse.json(
      { error: "resource_path is required" },
      { status: 400 },
    );
  }

  const data = await fetchKnowledgeBaseChildren(kbId, {
    resourcePath: resource_path,
    cursor,
  });

  return NextResponse.json(data);
}
