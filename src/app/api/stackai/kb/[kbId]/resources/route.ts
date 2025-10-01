import { NextRequest, NextResponse } from "next/server";

import {
  addKnowledgeBaseResource,
  deleteKnowledgeBaseResource,
} from "@/services/stack/resources";

type ContextProps = { params: Promise<{ kbId: string }> };

export async function DELETE(req: NextRequest, context: ContextProps) {
  const resourcePath = req.nextUrl.searchParams.get("resource_path");
  const { kbId } = await context.params;

  if (!kbId || !resourcePath) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  await deleteKnowledgeBaseResource(kbId, resourcePath);

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

  await addKnowledgeBaseResource(kbId, form);

  return NextResponse.json({ status: "added" });
}
