import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    GITHUB_CLIENT_ID: z.string().min(1, "Github Client ID is required."),
    GITHUB_SECRET: z.string().min(1, "Github Secret is required."),
  },
  runtimeEnvStrict: {
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_SECRET: process.env.GITHUB_SECRET,
  },
});
