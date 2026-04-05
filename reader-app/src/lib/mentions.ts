import { prisma } from "./db";

const MENTION_REGEX = /@(\w+)/gi;

/** Parse @mentions from text and return matched user IDs */
export async function parseMentions(text: string, excludeUserId: string): Promise<{ userId: string; name: string }[]> {
  const matches = text.match(MENTION_REGEX);
  if (!matches) return [];

  const names = [...new Set(matches.map((m) => m.slice(1).toLowerCase()))];

  const users = await prisma.user.findMany({
    where: {
      id: { not: excludeUserId },
      OR: names.map((name) => ({
        name: { contains: name, mode: "insensitive" as const },
      })),
    },
    select: { id: true, name: true },
  });

  return users.map((u) => ({ userId: u.id, name: u.name ?? "Unknown" }));
}
