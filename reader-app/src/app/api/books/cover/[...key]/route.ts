import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { getFromR2 } from "@/lib/r2";

type Ctx = { params: Promise<{ key: string[] }> };

export async function GET(_request: NextRequest, context: Ctx) {
  const { error } = await requireAuth();
  if (error) return error;

  const { key } = await context.params;
  const objectKey = key.map(decodeURIComponent).join("/");

  const r2Resp = await getFromR2(objectKey);
  if (!r2Resp) {
    return NextResponse.json({ error: "Cover not found" }, { status: 404 });
  }

  const headers = new Headers();
  headers.set("Content-Type", r2Resp.headers.get("Content-Type") || "image/jpeg");
  headers.set("Cache-Control", "public, max-age=604800, immutable");

  return new NextResponse(r2Resp.body, { status: 200, headers });
}
