import { authenticatedOnly } from "@/server/auth/validate";
import React from "react";

export default async function OnboardingPage() {
  const { user } = await authenticatedOnly({ onboardCheck: false });

  return <div>Hello onobarding.</div>;
}
