import { type Post } from "@/server/db/schema/types";
import Link from "next/link";

function PostPreview({ post }: { post: Post }) {
  return (
    <Link href={`/post/${post.id}`} key={post.id}>
      <div className="px-4 py-2 overflow-hidden border border-gray-500 rounded-lg">
        <h3 className="font-semibold text-lg ">{post.title}</h3>
        <p className="text-ellipsis text-foreground-light font-light text-sm">
          {post.body}
        </p>
      </div>
    </Link>
  );
}

export default PostPreview;
