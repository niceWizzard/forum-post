"use client";

import { type Comment } from "@/server/db/schema/types";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
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
import { Heart, MessageSquare, Trash2, CornerDownRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { trpc } from "@/app/_trpc/client";
import { formatter } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";

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
      toast.error("Could not update like", {
        description: res.message,
      });
      return;
    }
    refetchCommentData();
  }, 300);

  return (
    <div className="space-y-2">
      {/* Comment Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Avatar
            fallback={comment.commenter?.username || "U"}
            className="h-6 w-6 text-[10px] font-semibold"
          />
          {comment.commenter ? (
            <Link
              className="text-xs font-semibold text-foreground hover:underline"
              href={`/user/${comment.commenter?.username}`}
            >
              @{comment.commenter.username}
            </Link>
          ) : (
            <span className="text-xs text-muted-foreground">deleted user</span>
          )}
          <span className="text-xs text-muted-foreground">&middot;</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>

        {user && user.id === comment.commenterId && (
          <LoadingButton
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            isLoading={isDeleting}
            loadingText=""
            onClick={async () => {
              setIsDeleting(true);
              const res = await deleteComment(comment.id);
              setIsDeleting(false);
              if (res.error) {
                toast.error("Could not delete comment", {
                  description: res.message,
                });
                return;
              }
              toast.success("Comment deleted");
              onDelete && onDelete();
            }}
          >
            <Trash2 className="h-3 w-3" />
          </LoadingButton>
        )}
      </div>

      {/* Body */}
      <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed pl-8">
        {comment.body}
      </p>

      {/* Comment Actions */}
      <div className="flex items-center gap-2 pl-8 pt-1 text-xs">
        <Button
          variant="ghost"
          size="sm"
          onClick={onLikeButtonClick}
          className={`h-6 px-2 text-xs font-normal gap-1 ${
            comment.isLiked
              ? "text-rose-500 hover:text-rose-600 bg-rose-500/10"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Heart
            className="h-3 w-3"
            fill={comment.isLiked ? "currentColor" : "none"}
          />
          <span>{formatter.format(comment.likeCount)}</span>
        </Button>

        {comment.replyToId == null &&
          comment.replyCount > 0 &&
          replies === undefined && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
              onClick={() => {
                fetchReplies();
              }}
            >
              <MessageSquare className="h-3 w-3" />
              <span>{comment.replyCount} {comment.replyCount === 1 ? "reply" : "replies"}</span>
            </Button>
          )}

        {comment.replyToId == null && !showReplyForm && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
            onClick={async () => {
              setShowReplyForm(true);
              if (replies == null) {
                await fetchReplies();
              }
            }}
          >
            <CornerDownRight className="h-3 w-3" />
            <span>Reply</span>
          </Button>
        )}
      </div>

      {/* Reply Form */}
      {showReplyForm && (
        <div className="pl-8 pt-2">
          <CommentReplyForm
            comment={comment}
            onReplyCreate={() => {
              fetchReplies();
              setShowReplyForm(false);
            }}
            onCancel={() => setShowReplyForm(false)}
          />
        </div>
      )}

      {/* Nested Replies */}
      {replies && replies.length > 0 && (
        <div className="ml-8 mt-3 pl-3 border-l-2 border-border/80 space-y-3">
          {replies
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
      )}
    </div>
  );
}

function CommentReplyForm({
  comment,
  onReplyCreate,
  onCancel,
}: {
  comment: Comment;
  onReplyCreate: () => void;
  onCancel: () => void;
}) {
  const replyText = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!replyText.current?.value.trim()) return;
    setIsLoading(true);
    const value = replyText.current.value.trim();
    replyText.current.value = "";
    const res = await replyToComment(comment.id, value);
    setIsLoading(false);
    if (res.error) {
      toast.error("Could not send reply", {
        description: res.message,
      });
      return;
    }
    toast.success("Reply posted");
    onReplyCreate();
  }

  return (
    <form className="flex items-center gap-2 max-w-md" onSubmit={onSubmit}>
      <Input
        placeholder="Write a reply..."
        className="h-8 text-xs"
        ref={replyText}
        autoFocus
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 text-xs px-2"
        onClick={onCancel}
      >
        Cancel
      </Button>
      <LoadingButton
        size="sm"
        className="h-8 text-xs px-3"
        isLoading={isLoading}
      >
        Reply
      </LoadingButton>
    </form>
  );
}
