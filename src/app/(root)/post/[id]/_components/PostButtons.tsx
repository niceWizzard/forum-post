"use client";
import { likePost, unlikePost } from "@/server/db/actions/post";
import { Post } from "@/server/db/schema/types";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";

function PostButtons({ post }: { post: Post }) {
  const router = useRouter();
  const user = useUserStore((v) => v.user);
  return (
    <div className="flex gap-3 border-t border-t-foreground-light py-4">
      <button
        onClick={async () => {
          if (!user) {
            router.push("/login");
            return;
          }
          const res = await (post.isLiked
            ? unlikePost(post.id)
            : likePost(post.id));
          if (res.error) {
            console.error(res.error);
            return;
          }
          router.refresh();
        }}
      >
        {post.isLiked != null ? (post.isLiked ? "Liked" : "Like") : "Like"}{" "}
        {post.likeCount} likes
      </button>
      <button>Comment</button>
      <button>Share</button>
    </div>
  );
}

export default PostButtons;
