import { stackFetch } from "@/app/api/stackai/utils";
import { NextResponse } from "next/server";

export async function GET() {
  const res: Response = await stackFetch("/organizations/me/current", {
    method: "GET",
  });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
