"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo } from "react";
import { trpc } from "../_trpc/client";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";

export default function ClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { queryClient, trpcClient } = useMemo(
    () => ({
      queryClient: new QueryClient(),
      trpcClient: trpc.createClient({
        links: [
          httpBatchLink({
            url: `/api/trpc`,
          }),
        ],
        transformer: superjson,
      }),
    }),
    []
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
