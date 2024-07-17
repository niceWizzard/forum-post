import { env } from "@/env/server.mjs";
import { drizzle } from "drizzle-orm/neon-http";
import * as userSchemas from "@/server/db/schema";
import * as commentSchemas from "@/server/db/schema/comment";
import * as forumSchemas from "@/server/db/schema/forum";
import * as postSchemas from "@/server/db/schema/post";
import * as notificationSchemas from "@/server/db/schema/notification";
import { neon } from "@neondatabase/serverless";

const client = neon(env.NEON_DATABASE_URL);

const schemas = {
  ...userSchemas,
  ...commentSchemas,
  ...forumSchemas,
  ...postSchemas,
  ...notificationSchemas,
};
export const db = drizzle(client, {
  schema: schemas,
});
