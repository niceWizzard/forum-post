import { env } from "@/env/server.mjs";

import { defineConfig } from "drizzle-kit";

const schemaPath = "./src/server/db/schema";
const schemas = [
  "index.ts",
  "comment.ts",
  "forum.ts",
  "post.ts",
  "notification.ts",
];
export default defineConfig({
  dialect: "postgresql",
  schema: schemas.map((v) => `${schemaPath}/${v}`),
  out: "./drizzle",
  dbCredentials: {
    url: env.NEON_DATABASE_URL,
  },
});
