import { stackFetch } from "@/app/api/stackai/utils";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest, { params }: { params: Promise<{ kbId: string }> }) {
  const { kbId } = await params;

  const resource_path = req.nextUrl.searchParams.get("resource_path");
  const cursor = req.nextUrl.searchParams.get("cursor");

  if (!resource_path) {
    return NextResponse.json(
      { error: "resource_path is required" },
      { status: 400 },
    );
  }

  const qs = new URLSearchParams({ resource_path: resource_path ?? "/" });
  if (cursor) qs.set("cursor", cursor);

  const res: Response = await stackFetch(`/knowledge_bases/${kbId}/resources/children?${qs}`);
  
  return NextResponse.json(res, { status: res.status });
}
