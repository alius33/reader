import { NextRequest, NextResponse } from "next/server";

const R2_PUBLIC = "https://pub-52bbb41d6274422ca4ef5c93bf26d230.r2.dev";

type RouteContext = { params: Promise<{ key: string[] }> };

/**
 * Streaming proxy for R2 audio files.
 * Supports Range requests so the browser can seek.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  const { key } = await context.params;
  const objectKey = key.map(decodeURIComponent).join("/");
  const r2Url = `${R2_PUBLIC}/${encodeURIComponent(objectKey).replace(/%2F/g, "/")}`;

  // Forward Range header for seeking support
  const headers: HeadersInit = {};
  const range = request.headers.get("Range");
  if (range) headers["Range"] = range;

  const r2Resp = await fetch(r2Url, { headers });

  if (!r2Resp.ok && r2Resp.status !== 206) {
    return NextResponse.json(
      { error: "Failed to fetch audio from storage" },
      { status: r2Resp.status },
    );
  }

  const respHeaders = new Headers();
  respHeaders.set("Content-Type", r2Resp.headers.get("Content-Type") || "audio/mpeg");
  if (r2Resp.headers.get("Content-Length"))
    respHeaders.set("Content-Length", r2Resp.headers.get("Content-Length")!);
  if (r2Resp.headers.get("Content-Range"))
    respHeaders.set("Content-Range", r2Resp.headers.get("Content-Range")!);
  respHeaders.set("Accept-Ranges", "bytes");
  respHeaders.set("Cache-Control", "public, max-age=86400");

  return new NextResponse(r2Resp.body, {
    status: r2Resp.status,
    headers: respHeaders,
  });
}
