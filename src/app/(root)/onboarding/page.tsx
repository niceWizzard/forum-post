import { authenticatedOnly } from "@/server/auth/validate";
import OnBoardingForm from "./_components/onboardingForm";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const { user } = await authenticatedOnly({ onboardCheck: false });
  if (user.name != null || user.username != null) {
    redirect("/feed");
  }

  return (
    <section className="py-4 h-screen">
      <div className="container bg-card rounded-md p-6 mx-auto w-96 min-h-96 flex flex-col">
        <h2 className="text-xl font-semibold">Onboarding</h2>
        <OnBoardingForm />
      </div>
    </section>
  );
}
