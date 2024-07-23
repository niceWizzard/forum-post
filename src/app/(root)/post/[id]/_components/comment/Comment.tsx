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

import { Divide, Heart } from "lucide-react";
import { ApiResponse } from "@/server/apiResponse";
import { Input } from "@/components/ui/input";
import { trpc } from "@/app/_trpc/client";
import { RSC_PREFETCH_SUFFIX } from "next/dist/lib/constants";
import { Trocchi } from "next/font/google";
import { formatter } from "@/lib/utils";

export function Comment({
  comment: initialData,
  onDelete,
  utils,
}: {
  comment: Comment;
  onDelete?: () => void;
  utils: ReturnType<typeof trpc.useUtils>;
}) {
  const user = useUserStore((v) => v.user);
  const [isDeleting, setIsDeleting] = useState(false);
  const { refetch: fetchReplies, data: replies } =
    trpc.getCommentReplies.useQuery(initialData.id, {
      enabled: false,
    });
  const { data: comment, refetch: refetchCommentData } =
    trpc.getComment.useQuery(initialData.id, {
      initialData,
      refetchOnMount: false,
      enabled: false,
    });
  const [showReplyForm, setShowReplyForm] = useState(false);

  const onLikeButtonClick = useDebouncedCallback(async () => {
    utils.getComment.cancel(comment.id);
    const originalData = utils.getComment.getData();
    utils.getComment.setData(comment.id, (old) =>
      !old
        ? undefined
        : {
            ...old,
            isLiked: old.isLiked == null ? null : !old.isLiked,
            likeCount: old?.isLiked ? old.likeCount - 1 : old.likeCount + 1,
          }
    );
    const res = await toggleLikeComment(comment.id);
    if (res.error) {
      utils.getComment.setData(comment.id, originalData);
      toast.error("An error has occurred", {
        description: res.message,
      });
      return;
    }
    refetchCommentData();
  }, 300);

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
                return;
              }
              onDelete && onDelete();
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
          {formatter.format(comment.likeCount)}
          {<Heart fill={comment.isLiked ? "currentColor" : ""} />}
        </Button>

        {comment.replyToId == null &&
          comment.replyCount > 0 &&
          replies == undefined && (
            <Button
              variant="ghost"
              onClick={() => {
                fetchReplies();
              }}
            >
              {comment.replyCount} replies
            </Button>
          )}
        {comment.replyToId == null && !showReplyForm && (
          <Button
            variant="ghost"
            onClick={async () => {
              setShowReplyForm(true);
              replies == null && (await fetchReplies());
            }}
          >
            Reply
          </Button>
        )}
      </div>
      {showReplyForm && (
        <CommentReplyForm comment={comment} onReplyCreate={fetchReplies} />
      )}
      <div className="flex flex-col px-6 divide-y bg-card">
        {replies &&
          replies
            .map((v) => ({ ...v, replyCount: 0 }))
            .map((reply) => (
              <Comment
                comment={reply}
                key={reply.id}
                onDelete={fetchReplies}
                utils={utils}
              />
            ))}
      </div>
    </div>
  );
}

function CommentReplyForm({
  comment,
  onReplyCreate,
}: {
  comment: Comment;
  onReplyCreate: () => void;
}) {
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
    onReplyCreate();
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
