import { validateRequest } from "@/server/auth/action";
import { authenticatedOnly } from "@/server/auth/validate";
import { getCreatedForums } from "@/server/db/actions/forum";
import { redirect } from "next/navigation";
import React from "react";

export default async function FeedPage() {
  const { user } = await authenticatedOnly();

  const createdForums = await getCreatedForums(user.id);

  return (
    <div>
      <pre>{JSON.stringify(createdForums, null, 2)}</pre>
    </div>
  );
}
