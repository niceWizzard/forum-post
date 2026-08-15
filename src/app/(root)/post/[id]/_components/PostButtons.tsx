"use client";

import { trpc } from "@/app/_trpc/client";
import { Button } from "@/components/ui/button";
import { likePost, unlikePost } from "@/server/db/actions/post";
import { Post } from "@/server/db/schema/types";
import { useUserStore } from "@/store/userStore";
import { Heart, MessageSquare, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";
import clone from "lodash.clone";
import { formatter } from "@/lib/utils";

function PostButtons({ post, refetch }: { post: Post; refetch: () => void }) {
  const router = useRouter();
  const user = useUserStore((v) => v.user);
  const utils = trpc.useUtils();

  function optimisticLike() {
    utils.getPost.cancel();
    utils.getPost.setData({ postId: post.id }, (old) => {
      if (!old) return undefined;
      return {
        ...old,
        isLiked: !old?.isLiked,
        likeCount: old?.isLiked ? old.likeCount - 1 : old.likeCount + 1,
      };
    });
  }

  const updateLikeStatus = useDebouncedCallback(async (origPost: Post) => {
    const res = await (origPost.isLiked
      ? unlikePost(origPost.id)
      : likePost(origPost.id));
    if (res.error) {
      console.error(res.message);
      toast.error("Could not update like status", {
        description: res.message,
      });
      return;
    }
    refetch();
  }, 200);

  const onLike = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    const orig = clone(post);
    optimisticLike();
    await updateLikeStatus(orig);
  };

  const onShare = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  return (
    <div className="flex items-center gap-3 border-t border-border pt-4 text-xs">
      <Button
        variant="ghost"
        size="sm"
        className={`gap-1.5 h-8 px-3 font-medium ${
          post.isLiked
            ? "text-rose-500 hover:text-rose-600 bg-rose-500/10"
            : "text-muted-foreground hover:text-foreground"
        }`}
        onClick={onLike}
      >
        <Heart
          className="h-4 w-4"
          fill={post.isLiked ? "currentColor" : "none"}
        />
        <span>{formatter.format(post.likeCount)}</span>
      </Button>

      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-muted-foreground font-medium">
        <MessageSquare className="h-4 w-4" />
        <span>{post.commentCount} comments</span>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 h-8 px-3 text-muted-foreground hover:text-foreground ml-auto font-medium"
        onClick={onShare}
      >
        <Share2 className="h-3.5 w-3.5" />
        <span>Share</span>
      </Button>
    </div>
  );
}

export default PostButtons;
