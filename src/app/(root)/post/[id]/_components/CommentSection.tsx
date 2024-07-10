"use client";

import { type Comment, PostWithComments } from "@/server/db/schema/types";
import { CommentForm } from "./CommentForm";
import { Button } from "@/components/ui/button";
import { formatDistance } from "date-fns";
import Link from "next/link";

interface Props {
  post: PostWithComments;
}

export default function CommentSection({ post }: Props) {
  return (
    <section className="">
      <div className="border-b pb-2 flex justify-between">
        <h4>{post.commentCount} Comments</h4>
        <button>Sort</button>
      </div>
      <CommentForm post={post} />
      <div className="flex flex-col gap-3 divide-y divide-foreground-lighter">
        {post.initialComments.map((v) => (
          <Comment comment={v} key={v.id} />
        ))}
        {post.initialComments.length === 0 && (
          <div className="text-center text-sm font-light text-foreground-lighter">
            No comments yet..
          </div>
        )}
      </div>
    </section>
  );
}

function Comment({ comment }: { comment: Comment }) {
  return (
    <div className="space-y-2 py-2">
      {comment.commenter ? (
        <Link
          className="text-sm hover:underline"
          href={`/user/${comment.commenter?.username}`}
        >
          @{comment.commenter.username}
        </Link>
      ) : (
        <span className="text-sm">deleted</span>
      )}
      <span className="text-xs font-light text-foreground-lighter block">
        {formatDistance(new Date(comment.createdAt), new Date(), {
          addSuffix: true,
        })}
      </span>
      <p className="text-sm">{comment.body}</p>
      <div className="flex gap-2">
        <Button variant="ghost">{comment.likeCount} Like</Button>
        <Button variant="ghost">Reply</Button>
      </div>
    </div>
  );
}
