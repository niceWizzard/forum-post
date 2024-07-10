"use client";

import { Post } from "@/server/db/schema/types";
import { CommentForm } from "./CommentForm";

interface Props {
  post: Post;
}

export default function CommentSection({ post }: Props) {
  return (
    <section className="">
      <div className="border-b pb-2 flex justify-between">
        <h4>{2} Comments</h4>
        <button>Sort</button>
      </div>
      <CommentForm post={post} />
    </section>
  );
}
