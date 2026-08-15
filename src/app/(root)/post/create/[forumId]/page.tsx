import PostCreateForm from "./_components/postCreateForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "ForumPost - Create Discussion",
  description: "Publish a new discussion post to the community",
};

interface Props {
  params: { forumId: string };
}

export default function PostCreatePage({ params: { forumId } }: Props) {
  return (
    <section className="container max-w-2xl py-10 px-4 sm:px-8">
      <Card className="border-border shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl font-bold">Create a Discussion</CardTitle>
          <CardDescription className="text-xs">
            Share an idea, question, or story with the community.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PostCreateForm forumId={forumId} />
        </CardContent>
      </Card>
    </section>
  );
}
