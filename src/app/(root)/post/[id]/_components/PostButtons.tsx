"use client";
import { trpc } from "@/app/_trpc/client";
import { Button } from "@/components/ui/button";
import { likePost, unlikePost } from "@/server/db/actions/post";
import { Post } from "@/server/db/schema/types";
import { useUserStore } from "@/store/userStore";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";
import clone from "lodash.clone";

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
      toast.error("An error has occurred", {
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
  return (
    <div className="flex gap-3 border-t border-t-foreground-light py-4">
      <Button className="flex gap-2" variant="ghost" onClick={onLike}>
        <Heart fill={post.isLiked ? "currentColor" : ""} /> {post.likeCount}
      </Button>
      <button>Share</button>
    </div>
  );
}

export default PostButtons;
