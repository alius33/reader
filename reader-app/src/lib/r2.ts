import { AwsClient } from "aws4fetch";

const r2 = new AwsClient({
  accessKeyId: process.env.R2_BOOKS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.R2_BOOKS_SECRET_ACCESS_KEY!,
});

const ENDPOINT = process.env.R2_BOOKS_ENDPOINT!;
const BUCKET = process.env.R2_BOOKS_BUCKET!;

function url(key: string) {
  return `${ENDPOINT}/${BUCKET}/${key}`;
}

export async function uploadToR2(key: string, body: Uint8Array | ReadableStream, contentType: string) {
  const res = await r2.fetch(url(key), {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: body as unknown as BodyInit,
  });
  if (!res.ok) throw new Error(`R2 upload failed: ${res.status} ${await res.text()}`);
  return key;
}

export async function getFromR2(key: string) {
  const res = await r2.fetch(url(key));
  if (!res.ok) return null;
  return res;
}

export async function deleteFromR2(key: string) {
  const res = await r2.fetch(url(key), { method: "DELETE" });
  if (!res.ok && res.status !== 404) throw new Error(`R2 delete failed: ${res.status}`);
}
