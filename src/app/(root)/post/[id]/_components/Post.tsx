"use client";
import { PostWithComments } from "@/server/db/schema/types";
import Link from "next/link";
import PostMenu from "./PostMenu";
import PostBody from "./PostBody";
import PostButtons from "./PostButtons";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import CommentSection from "./comment/CommentSection";
import { trpc } from "@/app/_trpc/client";

export default function PostComponent({
  initialValue,
}: {
  initialValue: PostWithComments;
}) {
  const { data: post, refetch } = trpc.getPost.useQuery(
    { postId: initialValue.id },
    {
      initialData: initialValue,
      refetchOnMount: true,
    }
  );
  const searchParams = useSearchParams();
  const commentPageNumber = useMemo(() => {
    const a = searchParams.get("commentPage");
    return a ? Number(a) : 1;
  }, [searchParams]);

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
            <Link
              href={post.poster ? `/profile/${post.posterId}` : "#"}
              className="underline"
            >
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
          <PostButtons post={post} refetch={refetch} />
        </div>
        <CommentSection post={initialValue} pageNumber={commentPageNumber} />
      </div>
    </section>
  );
}
