import { env } from "@/env/server.mjs";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(env.NEON_DATABASE_URL);

export const db = drizzle(client);
