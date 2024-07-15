import { authenticatedOnly } from "@/server/auth/validate";
import UserAccountDeleteButton from "./_components/UserAccountDeleteButton";
import OnBoardingForm from "../onboarding/_components/onboardingForm";

export default async function SettingsPage() {
  const { user } = await authenticatedOnly();

  return (
    <section className="py-6">
      <div className="container">
        <h3>Edit your information</h3>
        <OnBoardingForm name={user.name} username={user.username} />

        <UserAccountDeleteButton />
      </div>
    </section>
  );
}
