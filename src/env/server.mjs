import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    NEON_DATABASE_URL: z.string().url("DATABASE URL IS REQUIRED."),
    GITHUB_CLIENT_ID: z.string().min(1, "GITHUB CLIENT ID IS REQUIRED."),
    GITHUB_CLIENT_SECRET: z
      .string()
      .min(1, "GITHUB CLIENT SECRET IS REQUIRED."),
  },
  runtimeEnvStrict: {
    NEON_DATABASE_URL: process.env.NEON_DATABASE_URL,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  },
});
