import { getPostById } from "@/server/db/queries/post";
import Link from "next/link";
import PostButtons from "./_components/PostButtons";
import PostMenu from "./_components/PostMenu";
import CommentSection from "./_components/CommentSection";
import PostBody from "./_components/PostBody";
import { asSortOrder, isSortType, SortType } from "@/server/db/schema/types";

interface Props {
  params: { id: string };
  searchParams: { commentPage?: string; sort?: string; order?: string };
}

export const dynamic = "force-dynamic";

export default async function PostPage({
  params: { id },
  searchParams: { commentPage, sort, order },
}: Props) {
  const commentPageNumber = commentPage ? Number(commentPage) : 1;

  const sortBy = isSortType(sort) ? sort : "newest";
  const sortOrder = asSortOrder(order);

  const res = await getPostById({
    id,
    commentPageNumber,
    sort: sortBy,
    sortOrder,
  });
  if (res.error) {
    return res.message;
  }

  const post = res.data;

  return (
    <section className="py-6">
      <div className="container flex flex-col">
        <div className="flex-flex-col bg-card px-4 py-2">
          <div className="flex justify-between">
            <h3>{post.title}</h3>
            <PostMenu post={post} />
          </div>
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
          <PostBody postBody={post.body} />
          <PostButtons post={post} />
        </div>
        <CommentSection post={post} pageNumber={commentPageNumber} />
      </div>
    </section>
  );
}
