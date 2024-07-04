import { env } from "@/env/server.mjs";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as userSchemas from "@/server/db/schema";
import * as commentSchemas from "@/server/db/schema/comment";
import * as forumSchemas from "@/server/db/schema/forum";
import * as postSchemas from "@/server/db/schema/post";

const client = postgres(env.NEON_DATABASE_URL);

export const db = drizzle(client, {
  schema: {
    ...userSchemas,
    ...commentSchemas,
    ...forumSchemas,
    ...postSchemas,
  },
});
