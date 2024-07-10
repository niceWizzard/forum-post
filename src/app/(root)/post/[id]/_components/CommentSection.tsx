"use client";

import { Post } from "@/server/db/schema/types";
import { CommentForm } from "./CommentForm";
import { Button } from "@/components/ui/button";

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
      <div className="flex flex-col gap-3 divide-y divide-foreground-lighter">
        <Comment post={post} />
        <Comment post={post} />
        <Comment post={post} />
      </div>
    </section>
  );
}

function Comment({ post }: { post: Post }) {
  return (
    <div className="flex flex-col gap-2 py-2">
      <span className="text-sm">@username</span>
      <span className="text-xs font-light text-foreground-lighter">
        1 hour ago
      </span>
      <p className="text-sm">
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Obcaecati,
        perferendis quidem asperiores iusto dolorem excepturi, ea culpa nesciunt
        quia voluptate aspernatur aliquid quibusdam magni molestias temporibus
        modi, necessitatibus aut numquam quae magnam inventore deserunt et
        doloremque? Cum magni libero ullam? Soluta esse amet porro quos itaque
        blanditiis praesentium corrupti eveniet laudantium est corporis numquam
        iste ipsa, natus nemo rerum, iusto, cum dolorum molestias. Quibusdam
        praesentium vero possimus beatae totam. Quaerat soluta dignissimos quasi
        autem accusantium, dolorum voluptates reiciendis! Nemo quo numquam
        mollitia quam commodi debitis dolore, magnam totam asperiores sit ipsum
        a ex fugiat similique consectetur velit ducimus beatae culpa.
      </p>
      <div className="flex gap-2">
        <Button variant="ghost">Like</Button>
        <Button variant="ghost">Reply</Button>
      </div>
    </div>
  );
}
