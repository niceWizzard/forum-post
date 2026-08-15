import { authenticatedOnly } from "@/server/auth/validate";
import { getForumAdminInvite, getForumById } from "@/server/db/queries/forum";
import { redirect } from "next/navigation";
import AcceptButtons from "./_components/AcceptButtons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ForumAdminInvitePage({
  params: { id },
}: {
  params: { id?: string };
}) {
  if (!id) {
    return (
      <div className="container py-12 text-center text-destructive">
        Invalid community identifier.
      </div>
    );
  }

  const user = await authenticatedOnly();
  const forumRes = await getForumById(id);
  if (forumRes.error) {
    return (
      <div className="container py-12 text-center text-destructive">
        {forumRes.message}
      </div>
    );
  }

  const adminRes = await getForumAdminInvite(id);
  if (adminRes.error) {
    return (
      <div className="container py-12 text-center text-destructive">
        {adminRes.message}
      </div>
    );
  }

  const invite = adminRes.data;
  if (invite.status !== "pending") {
    redirect(`/forum/${id}`);
  }

  return (
    <section className="flex min-h-[calc(100vh-12rem)] w-full items-center justify-center p-4">
      <Card className="w-full max-w-md border-border shadow-sm text-center">
        <CardHeader className="space-y-3 pb-2 flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Shield className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-bold">Moderator Invitation</CardTitle>
          <CardDescription className="text-xs max-w-sm">
            You have been invited to become a moderator for the{" "}
            <span className="font-semibold text-foreground">
              f/{forumRes.data.name}
            </span>{" "}
            community.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          <p className="text-xs text-muted-foreground">
            As a moderator, you will have permissions to manage posts, discussions, and invite other team members.
          </p>
          <AcceptButtons invite={invite} forumId={forumRes.data.id} />
        </CardContent>
      </Card>
    </section>
  );
}
