import { NextResponse } from "next/server";

import { triggerKnowledgeBaseSync } from "@/services/stack/resources";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ kbId: string; orgId: string }> },
) {
  const { kbId, orgId } = await params;
  await triggerKnowledgeBaseSync(kbId, orgId);

  return NextResponse.json({ 200: true });
}
