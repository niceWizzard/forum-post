import { PostWithPoster, type Post } from "@/server/db/schema/types";
import Link from "next/link";

function PostPreview({ post }: { post: PostWithPoster }) {
  return (
    <div className="py-4 overflow-hidden  px-2 ">
      <div className="hover:bg-card px-4 py-2 transition-all duration-200">
        <Link href={`/post/${post.id}`} key={post.id}>
          <div className="flex gap-1 items-center">
            <span></span>·
            <span className="text-xs text-foreground-light ">
              @{post.poster ? post.poster.username ?? "no username" : "deleted"}
            </span>
          </div>
          <h3 className="font-semibold text-md mb-4">{post.title}</h3>

          <p className="text-ellipsis text-foreground-light font-light text-sm">
            {post.body}
          </p>
        </Link>
      </div>
    </div>
  );
}

export default PostPreview;
