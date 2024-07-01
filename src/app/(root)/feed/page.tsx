import { validateRequest } from "@/server/auth/action";
import { authenticatedOnly } from "@/server/auth/validate";
import { redirect } from "next/navigation";
import React from "react";

export default async function FeedPage() {
  const { user } = await authenticatedOnly();

  return (
    <div>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}
