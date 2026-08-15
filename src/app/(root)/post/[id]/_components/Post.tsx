"use client";

import { PostWithComments } from "@/server/db/schema/types";
import Link from "next/link";
import PostMenu from "./PostMenu";
import PostBody from "./PostBody";
import PostButtons from "./PostButtons";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import CommentSection from "./comment/CommentSection";
import { trpc } from "@/app/_trpc/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PostComponent({
  initialValue,
}: {
  initialValue: PostWithComments;
}) {
  const { data: post, refetch } = trpc.getPost.useQuery(
    { postId: initialValue.id },
    {
      initialData: initialValue,
      refetchOnMount: true,
    }
  );
  const searchParams = useSearchParams();
  const commentPageNumber = useMemo(() => {
    const a = searchParams.get("commentPage");
    return a ? Number(a) : 1;
  }, [searchParams]);

  return (
    <div className="container max-w-4xl py-8 px-4 sm:px-8 space-y-6">
      {/* Back Link */}
      <div>
        <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <Link href={`/forum/${post.forumId}`}>
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to f/{post.forum?.name}
          </Link>
        </Button>
      </div>

      {/* Main Post Card */}
      <Card className="border-border shadow-sm">
        <CardHeader className="p-5 sm:p-6 pb-4 space-y-4 border-b border-border/60">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar
                fallback={post.poster?.username || "U"}
                className="h-10 w-10 text-xs font-semibold"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <Link
                    href={post.poster ? `/profile/${post.posterId}` : "#"}
                    className="text-sm font-semibold text-foreground hover:underline"
                  >
                    @{post.poster?.username ?? "deleted"}
                  </Link>
                  <Badge variant="outline" className="text-[10px] font-mono py-0 h-4">
                    f/{post.forum?.name}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>

            <PostMenu post={post} />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug">
            {post.title}
          </h1>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 space-y-6">
          <PostBody postBody={post.body} />
          <PostButtons post={post} refetch={refetch} />
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-5 sm:p-6">
          <CommentSection post={initialValue} pageNumber={commentPageNumber} />
        </CardContent>
      </Card>
    </div>
  );
}
