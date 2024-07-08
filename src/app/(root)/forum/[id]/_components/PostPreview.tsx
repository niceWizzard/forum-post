"use client";
import { type Post } from "@/server/db/schema/types";
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
          <span>{post.likeCount} likes</span>
        </div>
      </Link>
    </div>
  );
}

export default PostPreview;
