import { getPostById } from "@/server/db/queries/post";
import Link from "next/link";
import PostButtons from "./_components/PostButtons";

interface Props {
  params: { id: string };
}

export default async function PostPage({ params: { id } }: Props) {
  const res = await getPostById(id);
  if (res.error) {
    return "Invalid post";
  }

  const post = res.data;

  return (
    <section className="py-6">
      <div className="container flex flex-col">
        <div className="flex-flex-col bg-card px-4 py-2">
          <h3>{post.title}</h3>
          <div className="flex gap-3 text-foreground-lighter font-light text-sm items-center mt-2">
            <Link href={`/forum/${post.forumId}`} className="underline">
              f/{post.forum.name}
            </Link>
            &middot;
            <Link href={`/profile/${post.posterId}`} className="underline">
              {" "}
              @{post.poster?.username ?? "deleted"}
            </Link>
            <span className="text-xs">
              {new Date(post.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
        <div className="py-2 flex flex-col gap-4">
          <p className="text-md px-4 ">{post.body}</p>
          <PostButtons post={post} />
        </div>
      </div>
    </section>
  );
}
