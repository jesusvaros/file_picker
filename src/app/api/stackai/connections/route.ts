import { NextResponse } from "next/server";
import { stackFetch, type StackConnection } from "../utils";

export async function GET() {
  const data = await stackFetch<StackConnection[]>(
    `/connections?connection_provider=gdrive&limit=10`,
  );
  return NextResponse.json(data);
}
