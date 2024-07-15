import { authenticatedOnly } from "@/server/auth/validate";
import UserDetails from "./_components/UserDetails";
import UserAccountDeleteButton from "./_components/UserAccountDeleteButton";
import OnBoardingForm from "../onboarding/_components/onboardingForm";

export default async function SettingsPage() {
  const { user } = await authenticatedOnly();

  return (
    <section className="py-6">
      <div className="container">
        <h3>Edit your information</h3>
        <UserAccountDeleteButton />
      </div>
    </section>
  );
}
