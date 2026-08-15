"use client";

import { Button } from "@/components/ui/button";
import { formatter } from "@/lib/utils";
import { likePost, unlikePost } from "@/server/db/actions/post";
import { type Post } from "@/server/db/schema/types";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";

function PostPreview({ post }: { post: Post }) {
  const router = useRouter();

  function onInnerClick(
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    type: "forum" | "username"
  ) {
    e.preventDefault();
    e.stopPropagation();
    switch (type) {
      case "forum":
        router.push(`/forum/${post.forumId}`);
        break;
      case "username":
        if (post.poster) {
          router.push(`/profile/${post.posterId}`);
        }
        break;
    }
  }

  return (
    <Link href={`/post/${post.id}`} className="block group">
      <Card className="border-border/80 group-hover:border-border transition-all duration-200 group-hover:shadow-sm">
        <CardContent className="p-4 sm:p-5 space-y-2.5">
          {/* Metadata */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Avatar
              fallback={post.poster?.username || "U"}
              className="h-5 w-5 text-[10px] font-semibold"
            />
            <span
              className="font-medium text-foreground hover:underline cursor-pointer"
              onClick={(e) => onInnerClick(e, "username")}
            >
              @{post.poster?.username ?? "deleted"}
            </span>
            <span>&middot;</span>
            <span
              className="hover:underline cursor-pointer font-mono"
              onClick={(e) => onInnerClick(e, "forum")}
            >
              f/{post.forum?.name}
            </span>
            <span>&middot;</span>
            <span>
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-base sm:text-lg text-foreground group-hover:text-primary transition-colors tracking-tight leading-snug">
            {post.title}
          </h3>

          {/* Body Snippet */}
          {post.body && (
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {post.body}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 px-2.5 gap-1.5 text-xs font-normal ${
                post.isLiked
                  ? "text-rose-500 hover:text-rose-600 bg-rose-500/10"
                  : "hover:text-foreground"
              }`}
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const action = post.isLiked ? unlikePost : likePost;
                const res = await action(post.id);
                if (res.error) {
                  console.error(res.message);
                  toast.error("Could not complete action", {
                    description: res.message,
                  });
                  return;
                }
                router.refresh();
              }}
            >
              <Heart
                className="h-3.5 w-3.5"
                fill={post.isLiked ? "currentColor" : "none"}
              />
              <span>{formatter.format(post.likeCount)}</span>
            </Button>

            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{post.commentCount} comments</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default PostPreview;
