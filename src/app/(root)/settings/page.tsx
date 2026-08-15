import { authenticatedOnly } from "@/server/auth/validate";
import UserAccountDeleteButton from "./_components/UserAccountDeleteButton";
import OnBoardingForm from "../onboarding/_components/onboardingForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function SettingsPage() {
  const { user } = await authenticatedOnly();

  return (
    <div className="container max-w-2xl py-10 px-4 sm:px-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your profile identity and account preferences.
        </p>
      </div>

      {/* Profile Form Card */}
      <Card className="border-border shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg font-semibold">Profile Information</CardTitle>
          <CardDescription className="text-xs">
            Update your public display name and unique handle.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OnBoardingForm name={user.name} username={user.username} />
        </CardContent>
      </Card>

      {/* Danger Zone Card */}
      <Card className="border-destructive/40 bg-destructive/5 shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg font-semibold text-destructive">
            Danger Zone
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Permanently delete your account and all associated personal data. This action is irreversible.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <UserAccountDeleteButton />
        </CardContent>
      </Card>
    </div>
  );
}
