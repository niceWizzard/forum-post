import { authenticatedOnly } from "@/server/auth/validate";
import React from "react";
import OnBoardingForm from "./_components/onboardingForm";

export default async function OnboardingPage() {
  const { user } = await authenticatedOnly({ onboardCheck: false });

  return (
    <section className="py-4 h-screen">
      <div className="container bg-card rounded-md p-6 mx-auto w-96 h-96">
        <h2 className="text-xl font-semibold">Onboarding</h2>
        <OnBoardingForm />
      </div>
    </section>
  );
}
