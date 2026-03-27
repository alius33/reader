// Runtime environment validation — imported by db.ts before any Prisma call

const required = ["DATABASE_URL"] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
        `Copy .env.example to .env and fill in the values, or set it in your environment.`
    );
  }
}
