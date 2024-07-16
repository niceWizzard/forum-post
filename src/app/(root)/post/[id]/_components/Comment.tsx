"use client";

import { type Comment, ReplyComment } from "@/server/db/schema/types";
import { Button } from "@/components/ui/button";
import { formatDistance } from "date-fns";
import Link from "next/link";
import { deleteComment, toggleLikeComment } from "@/server/db/actions/comment";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";
import { useUserStore } from "@/store/userStore";
import { useState } from "react";
import { LoadingButton } from "@/components/ui/loadingButton";

import { env } from "@/env/client.mjs";

import { Heart } from "lucide-react";
import { ApiResponse } from "@/server/apiResponse";

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

        {comment.replyCount > 0 && (
          <Button
            variant="ghost"
            onClick={async () => {
              const res: ApiResponse<ReplyComment[]> = await (
                await fetch(
                  `${env.PUBLIC_BASE_URL}api/replies?commentId=${comment.id}`
                )
              ).json();
              if (res.error) {
                toast.error("An error has occurred", {
                  description: res.message,
                });
                return;
              }
              setReplies(res.data);
            }}
          >
            {comment.replyCount} replies
          </Button>
        )}
        <Button variant="ghost">Reply</Button>
      </div>
      <div className="flex flex-col pl-6">
        {replies.map((reply) => (
          <div key={reply.id} className="bg-card px-4 py-2">
            <span>{reply.commenter?.username ?? "deleted"}</span>
            <p className="text-foreground-light">{reply.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
