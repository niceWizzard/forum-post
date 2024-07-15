import { authenticatedOnly } from "@/server/auth/validate";
import UserAccountDeleteButton from "./_components/UserAccountDeleteButton";
import OnBoardingForm from "../onboarding/_components/onboardingForm";

export default async function SettingsPage() {
  const { user } = await authenticatedOnly();

  return (
    <section className="py-6">
      <div className="container space-y-4">
        <h3>Edit your information</h3>
        <OnBoardingForm name={user.name} username={user.username} />

        <div className="space-y-4">
          <h4 className="border-b pb-4 text-xl font-semibold">
            Delete your account
          </h4>
          <p className="text-sm font-light text-foreground-lighter">
            There is no going back to this.
          </p>
          <UserAccountDeleteButton />
        </div>
      </div>
    </section>
  );
}
