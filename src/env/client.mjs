import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "PUBLIC_",
  client: {
    PUBLIC_BASE_URL: z.string().min(1),
  },
  runtimeEnvStrict: {
    PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
});
