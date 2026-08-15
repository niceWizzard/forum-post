import ForumCreateForm from "./_components/ForumCreateForm";
import { authenticatedOnly } from "@/server/auth/validate";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "ForumPost - Create Community",
  description: "Create a new topic-based discussion forum",
};

const ForumCreatePage = async () => {
  const { user } = await authenticatedOnly();
  return (
    <section className="container max-w-2xl py-10 px-4 sm:px-8">
      <Card className="border-border shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl font-bold">Create a Community</CardTitle>
          <CardDescription className="text-xs">
            Start a new forum for your topic, team, or interest group.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForumCreateForm userId={user.id} />
        </CardContent>
      </Card>
    </section>
  );
};

export default ForumCreatePage;
