import { getPostById } from "@/server/db/queries/post";
import Link from "next/link";
import PostButtons from "./_components/PostButtons";

interface Props {
  params: { id: string };
}

export default async function PostPage({ params: { id } }: Props) {
  const res = await getPostById(id);
  if (!res) {
    return "Invalid post";
  }

  return (
    <section className="py-6">
      <div className="container flex flex-col">
        <div className="flex-flex-col bg-card px-4 py-2">
          <h3>{res.title}</h3>
          <div className="flex gap-3 text-foreground-lighter font-light text-sm items-center mt-2">
            <Link href={`/forum/${res.forumId}`} className="underline">
              f/{res.forum.name}
            </Link>
            &middot;
            <Link href={`/profile/${res.posterId}`} className="underline">
              {" "}
              @{res.poster?.username ?? "deleted"}
            </Link>
            <span className="text-xs">
              {new Date(res.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
        <div className="py-2 flex flex-col gap-4">
          <p className="text-md px-4 ">{res.body}</p>
          <PostButtons post={res} />
        </div>
      </div>
    </section>
  );
}
