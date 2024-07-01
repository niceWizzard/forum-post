import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    NEON_DATABASE_URL: z.string().url("DATABASE URL IS REQUIRED."),
  },
  runtimeEnvStrict: {
    NEON_DATABASE_URL: process.env.NEON_DATABASE_URL,
  },
});
