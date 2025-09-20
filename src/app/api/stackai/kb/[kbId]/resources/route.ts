import { stackFetch } from "@/app/api/stackai/utils";
import { NextRequest, NextResponse } from "next/server";

export type kbPostResourceType = {
  resource_path: string; // ej: "My Drive/Papers" o "My Drive/Folder/Doc.pdf"
  resource_type: "file" | "directory"; // viene de inode_type del children
  recursive?: boolean; // solo útil si es directory
};

type ContextProps = { params: Promise<{ kbId: string }> };

export async function DELETE(req: NextRequest, context: ContextProps) {
  const resourcePath = req.nextUrl.searchParams.get("resource_path");
  const { kbId } = await context.params;

  if (!kbId || !resourcePath) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  await stackFetch(
    `/knowledge_bases/${kbId}/resources?resource_path=${encodeURIComponent(resourcePath)}`,
    { method: "DELETE" },
  );

  return NextResponse.json({ status: "removed" });
}

// only for adding files status we dont need this for the demo
// 400, body: '{"detail":"A file binary is required when creating a file resource"}'

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ kbId: string }> },
) {
  const { kbId } = await ctx.params;

  const form = await req.formData();

  const resourcePath = form.get("resource_path");
  const resourceType = form.get("resource_type");

  if (!resourcePath || !resourceType) {
    return NextResponse.json(
      { error: "resource_path and resource_type are required" },
      { status: 422 },
    );
  }

  await stackFetch(`/knowledge_bases/${kbId}/resources`, {
    method: "POST",
    body: form,
  });

  return NextResponse.json({ status: "added" });
}
