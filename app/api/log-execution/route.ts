import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const LOG_PATH = path.join(process.cwd(), ".eve", "executions.json");

export async function POST(req: NextRequest) {
  const body = await req.json();
  let existing: unknown[] = [];
  try {
    const raw = await fs.readFile(LOG_PATH, "utf-8");
    existing = JSON.parse(raw);
  } catch {}
  existing.push({ ...body, ts: Date.now() });
  await fs.mkdir(path.dirname(LOG_PATH), { recursive: true });
  await fs.writeFile(LOG_PATH, JSON.stringify(existing, null, 2));
  return NextResponse.json({ ok: true });
}

export async function GET() {
  try {
    const raw = await fs.readFile(LOG_PATH, "utf-8");
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json([]);
  }
}
