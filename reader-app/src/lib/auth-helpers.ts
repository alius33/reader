import { auth } from "./auth";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";

type AuthSuccess = { session: Session & { user: { id: string } }; error: null };
type AuthError = { session: null; error: NextResponse };

export async function requireAuth(): Promise<AuthSuccess | AuthError> {
  const session = await auth();
  if (!session?.user?.id) {
    return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session: session as AuthSuccess["session"], error: null };
}
