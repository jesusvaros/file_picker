import { stackFetch } from "@/app/api/stackai/utils";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ kbId: string; orgId: string }> }
) {
  const { kbId, orgId } = await params;
  await stackFetch(`/knowledge_bases/sync/trigger/${kbId}/${orgId}`, {
    method: "GET",
  });

  return NextResponse.json({200: true});
}
