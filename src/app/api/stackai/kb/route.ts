import { NextRequest, NextResponse } from "next/server";
import { stackFetch } from "../utils";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const searchParams = url.searchParams.toString();
  const path = `/knowledge_bases${searchParams ? `?${searchParams}` : ""}`;

  const data = await stackFetch(path, { method: "GET" });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const data: Response = await stackFetch("/knowledge_bases", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
  console.log(data);
  return NextResponse.json(data, { status: data.status });
}
