import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { getFromR2 } from "@/lib/r2";

type Ctx = { params: Promise<{ key: string[] }> };

export async function GET(request: NextRequest, context: Ctx) {
  const { error } = await requireAuth();
  if (error) return error;

  const { key } = await context.params;
  const objectKey = key.map(decodeURIComponent).join("/");

  const r2Resp = await getFromR2(objectKey);
  if (!r2Resp) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const headers = new Headers();
  headers.set("Content-Type", r2Resp.headers.get("Content-Type") || "application/octet-stream");
  if (r2Resp.headers.get("Content-Length")) {
    headers.set("Content-Length", r2Resp.headers.get("Content-Length")!);
  }
  headers.set("Cache-Control", "private, max-age=3600");

  // Support range requests for PDF viewer
  const range = request.headers.get("Range");
  if (range) {
    headers.set("Accept-Ranges", "bytes");
  }

  return new NextResponse(r2Resp.body, { status: 200, headers });
}
