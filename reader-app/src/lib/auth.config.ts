import type { NextAuthConfig } from "next-auth";

const ALLOWED_EMAILS = (process.env.ALLOWED_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const authConfig: NextAuthConfig = {
  providers: [], // Providers configured in auth.ts (Node runtime) where env vars are available
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/signin" },
  callbacks: {
    signIn({ user }) {
      return ALLOWED_EMAILS.includes(user.email?.toLowerCase() ?? "");
    },
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "ADULT";
      }
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      if (token.role) (session.user as { role?: string }).role = token.role as string;
      return session;
    },
  },
};
