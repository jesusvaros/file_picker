import { NextResponse } from "next/server";
import { stackFetch } from "../utils";

export interface StackConnection {
  connection_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export async function GET() {
  const data = await stackFetch<StackConnection[]>(
    `/connections?connection_provider=gdrive&limit=10`,
  );
  return NextResponse.json(data);
}
