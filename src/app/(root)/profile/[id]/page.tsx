import { getUserProfile } from "@/server/db/queries/user";
import { ArrowRight, Calendar, MessageSquare, Users, MessagesSquare } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatter } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Props {
  params: { id: string };
}

export const revalidate = 60;

async function ProfilePage({ params: { id } }: Props) {
  const profileRes = await getUserProfile(id);

  if (profileRes.error) {
    return (
      <div className="container py-12 text-destructive">
        <p className="text-base">{profileRes.message}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/feed">&larr; Back to Feed</Link>
        </Button>
      </div>
    );
  }

  const profile = profileRes.data;

  if (!profile.user) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-xl font-bold">User Not Found</h1>
        <p className="text-xs text-muted-foreground mt-2">
          The requested profile does not exist or has been removed.
        </p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link href="/feed">Return to Feed</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-10 px-4 sm:px-8 space-y-8">
      {/* Profile Header Card */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <Avatar
            fallback={profile.user.name || profile.user.username || "U"}
            className="h-20 w-20 text-xl font-bold rounded-full"
          />
          <div className="space-y-1.5 flex-1 min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-foreground truncate">
              {profile.user.name || "Anonymous Member"}
            </h1>
            <p className="text-sm font-medium text-muted-foreground">
              @{profile.user.username || "nousername"}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MessagesSquare className="h-3.5 w-3.5" />
                {profile.createdForums.length} Communities Created
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Created Communities Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight">Created Communities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.createdForums.map((forum) => (
            <Link key={forum.id} href={`/forum/${forum.id}`} className="group">
              <Card className="h-full border-border/80 group-hover:border-border transition-all duration-200 group-hover:shadow-sm">
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar fallback={forum.name} className="h-8 w-8 text-xs font-bold rounded-lg" />
                    <CardTitle className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                      {forum.name}
                    </CardTitle>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {forum.description || "No description provided."}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1 text-[10px] font-normal">
                      <Users className="h-3 w-3" />
                      {formatter.format(forum.forumMembersCount)} members
                    </Badge>
                    <Badge variant="secondary" className="gap-1 text-[10px] font-normal">
                      <MessageSquare className="h-3 w-3" />
                      {formatter.format(forum.postCount)} posts
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          {profile.createdForums.length === 0 && (
            <div className="col-span-full py-12 text-center border rounded-lg border-dashed">
              <p className="text-xs text-muted-foreground">
                No communities created yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
