import { NextRequest, NextResponse } from "next/server";
import { Paginated, StackResource, stackFetch } from "../utils";

export async function GET(req: NextRequest) {
  const connectionId = req.nextUrl.searchParams.get("connectionId");
  const resourceId = req.nextUrl.searchParams.get("resourceId");
  const cursor = req.nextUrl.searchParams.get("cursor");

  if (!connectionId) {
    return NextResponse.json(
      { error: "connectionId is required" },
      { status: 400 },
    );
  }

  const q = new URLSearchParams();
  if (resourceId) q.set("resource_id", resourceId);
  if (cursor) q.set("cursor", cursor);

  const path =
    `/connections/${connectionId}/resources/children` +
    (q.toString() ? `?${q.toString()}` : "");

  const data = await stackFetch<Paginated<StackResource>>(path);
  return NextResponse.json(data);
}
