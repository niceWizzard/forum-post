"use client";

import { type Comment, ReplyComment } from "@/server/db/schema/types";
import { Button } from "@/components/ui/button";
import { formatDistance } from "date-fns";
import Link from "next/link";
import {
  deleteComment,
  replyToComment,
  toggleLikeComment,
} from "@/server/db/actions/comment";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";
import { useUserStore } from "@/store/userStore";
import { FormEvent, useRef, useState } from "react";
import { LoadingButton } from "@/components/ui/loadingButton";

import { env } from "@/env/client.mjs";

import { Heart } from "lucide-react";
import { ApiResponse } from "@/server/apiResponse";
import { Input } from "@/components/ui/input";
import { useEffectUpdate } from "@/lib/utils";

export function Comment({ comment }: { comment: Comment }) {
  const user = useUserStore((v) => v.user);
  const onLikeButtonClick = useDebouncedCallback(async () => {
    const res = await toggleLikeComment(comment.id);

    if (res.error) {
      toast.error("An error has occurred", {
        description: res.message,
      });
      return;
    }
  }, 300);

  const [isDeleting, setIsDeleting] = useState(false);
  const [replies, setReplies] = useState<ReplyComment[]>([]);
  const [showReplyForm, setShowReplyForm] = useState(false);

  useEffectUpdate(() => {
    fetchReplies();
  }, [comment.replyCount]);

  const fetchReplies = async () => {
    const res: ApiResponse<ReplyComment[]> = await (
      await fetch(`${env.PUBLIC_BASE_URL}api/replies?commentId=${comment.id}`)
    ).json();
    if (res.error) {
      toast.error("An error has occurred", {
        description: res.message,
      });
      return;
    }
    setReplies(res.data);
  };

  return (
    <div className="space-y-2 py-2">
      <div className="flex justify-between w-full">
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
        {user && user.id == comment.commenterId && (
          <LoadingButton
            isLoading={isDeleting}
            loadingText="Deleting..."
            onClick={async () => {
              setIsDeleting(true);
              const res = await deleteComment(comment.id);
              setIsDeleting(false);
              if (res.error) {
                toast.error("An error has occurred", {
                  description: res.message,
                });
              }
            }}
          >
            Delete
          </LoadingButton>
        )}
      </div>
      <span className="text-xs font-light text-foreground-lighter block">
        {formatDistance(new Date(comment.createdAt), new Date(), {
          addSuffix: true,
        })}
      </span>
      <p className="text-sm">{comment.body}</p>
      <div className="flex gap-2">
        <Button
          variant={"ghost"}
          onClick={onLikeButtonClick}
          className="flex items-center gap-2"
        >
          {comment.likeCount}
          {<Heart fill={comment.isLiked ? "currentColor" : ""} />}
        </Button>

        {comment.replyCount > 0 && replies.length == 0 && (
          <Button
            variant="ghost"
            onClick={() => {
              fetchReplies();
            }}
          >
            {comment.replyCount} replies
          </Button>
        )}
        {!showReplyForm && (
          <Button
            variant="ghost"
            onClick={async () => {
              replies.length == 0 && (await fetchReplies());
              setShowReplyForm(true);
            }}
          >
            Reply
          </Button>
        )}
      </div>
      {showReplyForm && <CommentReplyForm comment={comment} />}
      <div className="flex flex-col px-6 divide-y bg-card">
        {replies.map((reply) => (
          <Comment comment={reply} key={reply.id} />
        ))}
      </div>
    </div>
  );
}

function CommentReplyForm({ comment }: { comment: Comment }) {
  const replyText = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!replyText.current?.value) return;
    setIsLoading(true);
    const value = replyText.current.value;
    replyText.current.value = "";
    const res = await replyToComment(comment.id, value);
    setIsLoading(false);
    if (res.error) {
      console.error(res);
      toast.error("An error has occurred", {
        description: res.message,
      });
      return;
    }
  }
  return (
    <form className="flex gap-2 max-w-lg pl-6" onSubmit={onSubmit}>
      <Input placeholder="Reply" ref={replyText} />
      <LoadingButton isLoading={isLoading} variant="secondary">
        Reply
      </LoadingButton>
    </form>
  );
}
