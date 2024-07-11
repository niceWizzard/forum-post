import { env } from "@/env/server.mjs";
import { drizzle } from "drizzle-orm/neon-http";
import { drizzle as drizzleServerless } from "drizzle-orm/neon-serverless";
import * as userSchemas from "@/server/db/schema";
import * as commentSchemas from "@/server/db/schema/comment";
import * as forumSchemas from "@/server/db/schema/forum";
import * as postSchemas from "@/server/db/schema/post";
import { neon, Pool } from "@neondatabase/serverless";

const client = neon(env.NEON_DATABASE_URL);

const schemas = {
  ...userSchemas,
  ...commentSchemas,
  ...forumSchemas,
  ...postSchemas,
};
export const db = drizzle(client, {
  schema: schemas,
});

export async function createCustomDb() {
  const pool = new Pool({ connectionString: env.NEON_DATABASE_URL });
  return drizzleServerless(await pool.connect(), {
    schema: schemas,
  });
}
