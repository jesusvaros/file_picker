import { stackFetch } from '@/app/api/stackai/utils';
import { NextRequest, NextResponse } from "next/server";


type ContextProps = { params: Promise<{ kbId: string }> };

export async function DELETE(
  req: NextRequest,
  context:  ContextProps
) {
  const resourcePath = req.nextUrl.searchParams.get("resource_path");
  const { kbId } = await context.params;

  if (!kbId || !resourcePath) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  await stackFetch(
    `/knowledge_bases/${'1Rlbkh6yA1VG97Gv1aiBhVeB5Mv6s6Ncm'}/resources?resource_path=${encodeURIComponent(resourcePath)}`,
    { method: "DELETE" }
  );

  return NextResponse.json({ ok: true });
}

