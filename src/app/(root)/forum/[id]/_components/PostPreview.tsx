"use client";
import { Button } from "@/components/ui/button";
import { likePost, unlikePost } from "@/server/db/actions/post";
import { type Post } from "@/server/db/schema/types";
import { Heart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function PostPreview({ post }: { post: Post }) {
  const router = useRouter();
  function onInnerClick(
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    type: "forum" | "username"
  ) {
    e.preventDefault();
    switch (type) {
      case "forum":
        router.push(`/forum/${post.forumId}`);
        break;
      case "username":
        router.push(`/profile/${post.posterId}`);
        break;
    }
  }

  return (
    <div className="py-4 overflow-hidden  px-2 ">
      <Link href={`/post/${post.id}`}>
        <div className="hover:bg-card px-4 py-2 transition-all duration-200">
          <h3 className="font-semibold text-md ">{post.title}</h3>
          <div className="flex gap-1 items-center text-xs text-foreground-lighter cursor-pointer">
            <span
              className="hover:underline"
              onClick={(e) => onInnerClick(e, "forum")}
            >
              f/{post.forum.name}
            </span>
            ·
            <span
              className="hover:underline"
              onClick={(e) => onInnerClick(e, "username")}
            >
              @{post.poster ? post.poster.username ?? "no username" : "deleted"}
            </span>
          </div>
          <p className="text-ellipsis text-foreground-light font-light text-sm mt-4">
            {post.body}
          </p>
          <div className="mt-2 flex gap-3 items-center">
            <Button
              variant="ghost"
              className="px-2 flex gap-2"
              onClick={async (e) => {
                e.preventDefault();
                const action = post.isLiked ? unlikePost : likePost;
                const res = await action(post.id);
                if (res.error) {
                  console.error(res.message);
                }
                router.refresh();
              }}
            >
              <Heart fill={post.isLiked ? "currentColor" : ""} />{" "}
              {post.likeCount}
            </Button>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default PostPreview;
