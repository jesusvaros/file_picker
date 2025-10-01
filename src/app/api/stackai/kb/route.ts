import { NextRequest, NextResponse } from "next/server";

import {
  createKnowledgeBase,
  fetchKnowledgeBases,
} from "@/services/stack/knowledge-base";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const data = await fetchKnowledgeBases(searchParams);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Parameters<
    typeof createKnowledgeBase
  >[0];
  const created = await createKnowledgeBase(body);
  return NextResponse.json(created, { status: 201 });
}
