import { getForumById, getForumPosts } from "@/server/db/queries/forum";
import {
  asSortOrder,
  asSortType,
  type Forum,
  type Post,
} from "@/server/db/schema/types";
import Link from "next/link";
import PostPreview from "./_components/PostPreview";
import JoinButton from "./_components/JoinButton";
import ForumSettings from "./_components/ForumSettings";
import SortButton from "./_components/SortButton";
import { Metadata } from "next";
import { formatter } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Plus, Users, Inbox } from "lucide-react";

interface Props {
  params: { id: string };
  searchParams: { sort?: string; order?: string };
}

export async function generateMetadata({
  params: { id },
}: Props): Promise<Metadata> {
  const res = await getForumById(id);
  if (res.error) {
    throw new Error(res.message);
  }
  const forum = res.data;
  return {
    title: `${forum.name} - ForumPost`,
    description: forum.description || "Community discussions and posts",
  };
}

export const dynamic = "force-dynamic";

const ForumWithIdPage = async ({
  params: { id },
  searchParams: { order, sort },
}: Props) => {
  const res = await getForumById(id);
  if (res.error) {
    return (
      <div className="container py-12 text-destructive">
        <p className="text-base">{res.message}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/feed">&larr; Back to Communities</Link>
        </Button>
      </div>
    );
  }

  const forum = res.data;

  const sortType = asSortType(sort);
  const sortOrder = asSortOrder(order);

  const postsRes = await getForumPosts({
    forumId: id,
    sortOrder,
    sortType,
  });

  if (postsRes.error) {
    return <div className="container py-12 text-destructive">{postsRes.message}</div>;
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      <ForumHeader forum={forum} />
      <ForumContent posts={postsRes.data} forumId={forum.id} />
    </div>
  );
};

export default ForumWithIdPage;

function ForumHeader({ forum }: { forum: Forum }) {
  return (
    <div className="border-b border-border bg-card/60 py-8 px-4 sm:px-8">
      <div className="container max-w-5xl px-0 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar fallback={forum.name} className="h-14 w-14 rounded-xl text-base font-bold" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">{forum.name}</h1>
                <Badge variant="outline" className="text-xs font-mono">
                  f/{forum.name}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 font-medium">
                  <Users className="h-3.5 w-3.5" />
                  {formatter.format(forum.forumMembersCount)} members
                </span>
                <span>&middot;</span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {formatter.format(forum.postCount)} posts
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <JoinButton forum={forum} />
            <ForumSettings forum={forum} />
          </div>
        </div>

        {forum.description && (
          <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
            {forum.description}
          </p>
        )}
      </div>
    </div>
  );
}

function ForumContent({ posts, forumId }: { posts: Post[]; forumId: string }) {
  return (
    <div className="container max-w-5xl py-8 px-4 sm:px-8 space-y-6 flex-1">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Discussions</h2>
        <div className="flex items-center gap-2">
          <SortButton forumId={forumId} />
          <Button asChild size="sm" className="gap-1.5 font-medium">
            <Link href={`/post/create/${forumId}`}>
              <Plus className="h-4 w-4" /> New Post
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {posts.map((post) => (
          <PostPreview post={post} key={post.id} />
        ))}

        {posts.length === 0 && (
          <Card className="border-dashed border-border/80 text-center py-16">
            <CardContent className="flex flex-col items-center justify-center p-0">
              <Inbox className="h-10 w-10 text-muted-foreground mb-3 stroke-1 opacity-60" />
              <h3 className="text-base font-semibold">No discussions yet</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-5 max-w-sm">
                Start the conversation in this community by creating the very first post.
              </p>
              <Button asChild size="sm">
                <Link href={`/post/create/${forumId}`}>Create First Post</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
