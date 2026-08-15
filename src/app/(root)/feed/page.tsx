import { formatter } from "@/lib/utils";
import { authenticatedOnly } from "@/server/auth/validate";
import { getCreatedForums, getTrendingForums } from "@/server/db/queries/forum";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { MessagesSquare, Plus, Users, MessageSquare, ArrowRight } from "lucide-react";
import { RawForum } from "@/server/db/schema/types";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const { user } = await authenticatedOnly();

  const res = await getCreatedForums(user.id);
  const trendingForum = await getTrendingForums();

  if (res.error) {
    return <div className="container py-12 text-destructive">{res.message}</div>;
  }

  if (trendingForum.error) {
    return <div className="container py-12 text-destructive">{trendingForum.message}</div>;
  }

  const createdForums = (res.data || []) as RawForum[];
  const forums = trendingForum.data || [];

  return (
    <div className="container max-w-5xl py-8 sm:py-12 px-4 sm:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Explore Communities</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Discover active discussion boards or create your own community.
          </p>
        </div>
        <Button asChild className="gap-2 shrink-0">
          <Link href="/forum/create">
            <Plus className="h-4 w-4" /> Create Forum
          </Link>
        </Button>
      </div>

      {/* Created Forums Section (if any) */}
      {createdForums.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Your Communities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {createdForums.map((forum: RawForum) => (
              <Link key={forum.id} href={`/forum/${forum.id}`} className="group">
                <Card className="h-full border-border/80 group-hover:border-border transition-all duration-200 group-hover:shadow-sm">
                  <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar fallback={forum.name} className="h-10 w-10 text-xs font-bold rounded-lg" />
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors truncate">
                          {forum.name}
                        </CardTitle>
                        <span className="text-xs text-muted-foreground">Owner</span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {forum.description || "No description provided."}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Trending Forums Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Trending Communities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {forums.map((forum) => (
            <Link key={forum.id} href={`/forum/${forum.id}`} className="group">
              <Card className="h-full border-border/80 group-hover:border-border transition-all duration-200 group-hover:shadow-sm">
                <CardHeader className="p-4 pb-2 flex flex-row items-center gap-3 space-y-0">
                  <Avatar fallback={forum.name} className="h-10 w-10 text-xs font-bold rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors truncate">
                      {forum.name}
                    </CardTitle>
                    <span className="text-xs text-muted-foreground">f/{forum.name}</span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {forum.description || "No description provided."}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1 text-xs font-normal">
                      <Users className="h-3 w-3" />
                      {formatter.format(forum.forumMembersCount)} members
                    </Badge>
                    <Badge variant="secondary" className="gap-1 text-xs font-normal">
                      <MessageSquare className="h-3 w-3" />
                      {formatter.format(forum.postCount)} posts
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          {forums.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center border rounded-lg border-dashed">
              <MessagesSquare className="h-10 w-10 text-muted-foreground mb-3 stroke-1" />
              <h3 className="text-base font-medium">No communities found</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                Be the first to create a forum and start a new community.
              </p>
              <Button asChild size="sm">
                <Link href="/forum/create">Create Forum</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
