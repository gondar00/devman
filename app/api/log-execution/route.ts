import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("uid") ?? "anonymous";
  const raw = await kv.lrange(`executions:${userId}`, 0, 499);
  const executions = raw.map((item) =>
    typeof item === "string" ? JSON.parse(item) : item,
  );
  return NextResponse.json(executions);
}
