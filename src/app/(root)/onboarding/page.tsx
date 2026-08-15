import { authenticatedOnly } from "@/server/auth/validate";
import OnBoardingForm from "./_components/onboardingForm";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function OnboardingPage() {
  const { user } = await authenticatedOnly({ onboardCheck: false });
  if (user.name != null && user.username != null) {
    redirect("/feed");
  }

  return (
    <section className="flex min-h-[calc(100vh-8rem)] w-full items-center justify-center p-4">
      <Card className="w-full max-w-md border-border shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl font-bold">Complete your profile</CardTitle>
          <CardDescription className="text-xs">
            Choose a display name and unique username to participate in discussions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OnBoardingForm />
        </CardContent>
      </Card>
    </section>
  );
}
