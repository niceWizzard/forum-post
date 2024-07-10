"use client";

import { type Comment, PostWithComments } from "@/server/db/schema/types";
import { CommentForm } from "./CommentForm";
import { Button } from "@/components/ui/button";
import { formatDistance } from "date-fns";

interface Props {
  post: PostWithComments;
}

export default function CommentSection({ post }: Props) {
  return (
    <section className="">
      <div className="border-b pb-2 flex justify-between">
        <h4>{2} Comments</h4>
        <button>Sort</button>
      </div>
      <CommentForm post={post} />
      <div className="flex flex-col gap-3 divide-y divide-foreground-lighter">
        {post.comments.map((v) => (
          <Comment comment={v} key={v.id} />
        ))}
        {post.comments.length === 0 && (
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
    <div className="flex flex-col gap-2 py-2">
      <span className="text-sm">
        @{comment.commenter?.username ?? "deleted"}
      </span>
      <span className="text-xs font-light text-foreground-lighter">
        {formatDistance(new Date(comment.createdAt), new Date(), {
          addSuffix: true,
        })}
      </span>
      <p className="text-sm">{comment.body}</p>
      <div className="flex gap-2">
        <Button variant="ghost">Like</Button>
        <Button variant="ghost">Reply</Button>
      </div>
    </div>
  );
}
