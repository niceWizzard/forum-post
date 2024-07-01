import { validateRequest } from "@/server/auth/action";
import { redirect } from "next/navigation";
import React from "react";

export default async function FeedPage() {
  const { user } = await validateRequest();

  if (!user) {
    redirect("/login");
  }

  return <div>FeedPage</div>;
}
