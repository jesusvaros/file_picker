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
    `/knowledge_bases/${kbId}/resources?resource_path=${encodeURIComponent(resourcePath)}`,
    { method: "DELETE" }
  );

  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest, context: ContextProps) {
  const { kbId } = await context.params;

  // Expect multipart/form-data for KB file creation (per notebook)
  const form = await req.formData();

  const fd = new FormData();
  fd.append("resource_path", String(form.get("resource_path") || ""));
  fd.append("resource_type", String(form.get("resource_type") || "file"));
  const recursive = form.get("recursive");
  if (recursive != null) fd.append("recursive", String(recursive));

  const file = form.get("file");
  
  if (file) fd.append("file", file as File, (file as File).name || "file");

  const res: Response = await stackFetch(`/knowledge_bases/${kbId}/resources`, {
    method: "POST",
    body: fd, // let fetch set boundary; no Content-Type header
  });

  return NextResponse.json(null, { status: res.status });
}
