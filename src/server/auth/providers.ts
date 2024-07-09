import { env } from "@/env/server.mjs";
import { env as publicEnv } from "@/env/client.mjs";
import { GitHub, Google } from "arctic";

export const github = new GitHub(
  env.GITHUB_CLIENT_ID,
  env.GITHUB_CLIENT_SECRET
);

export const google = new Google(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  `${publicEnv.PUBLIC_BASE_URL}api/auth/google/callback`
);
