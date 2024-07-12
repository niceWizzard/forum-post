"use client";

import { type Comment, PostWithComments } from "@/server/db/schema/types";
import { CommentForm } from "./CommentForm";
import { Button } from "@/components/ui/button";
import { formatDistance } from "date-fns";
import Link from "next/link";
import { deleteComment, toggleLikeComment } from "@/server/db/actions/comment";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";
import { useUserStore } from "@/store/userStore";
import { useCallback, useEffect, useState } from "react";
import { LoadingButton } from "@/components/ui/loadingButton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { usePathname, useSearchParams } from "next/navigation";
import { env } from "@/env/client.mjs";
interface Props {
  post: PostWithComments;
  pageNumber: number;
}

export default function CommentSection({ post, pageNumber }: Props) {
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
      {post.commentCount > 10 && (
        <PaginationRow post={post} pageNumber={pageNumber} />
      )}
    </section>
  );
}

function PaginationRow({ post, pageNumber }: Props) {
  const totalCommentPages = Math.ceil(post.commentCount / 10);
  const [prevPageHref, setPrevPageHref] = useState("");
  const [nextPageHref, setNextPageHref] = useState("");
  const path = usePathname();
  const searchParams = useSearchParams();

  const toUrlPath = useCallback(
    (pageNum: number): string => {
      const url = new URL(env.PUBLIC_BASE_URL + path);
      searchParams.forEach((value, key) => url.searchParams.set(key, value));
      url.searchParams.set("commentPage", String(pageNum));
      return url.toString();
    },
    [path, searchParams]
  );

  useEffect(() => {
    console.log(path);
    const prevPageUrl = toUrlPath(pageNumber - 1);
    const nextPageUrl = toUrlPath(pageNumber + 1);
    setPrevPageHref(pageNumber == 1 ? "#" : prevPageUrl);
    setNextPageHref(pageNumber == totalCommentPages ? "#" : nextPageUrl);
  }, [pageNumber, totalCommentPages, post.id, path, toUrlPath]);
  return (
    <Pagination className="mt-3">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href={prevPageHref} />
        </PaginationItem>
        {...new Array(totalCommentPages).fill(1).map((v, i) => (
          <PaginationItem key={`page-${i}`}>
            <PaginationLink
              href={toUrlPath(i + 1)}
              isActive={i + 1 == pageNumber}
            >
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext href={nextPageHref} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function Comment({ comment }: { comment: Comment }) {
  const user = useUserStore((v) => v.user);
  const onLikeButtonClick = useDebouncedCallback(async () => {
    const res = await toggleLikeComment(comment.id);
    console.log("CLICKEd");

    if (res.error) {
      toast.error("An error has occurred", {
        description: res.message,
      });
      return;
    }
  }, 300);

  const [isDeleting, setIsDeleting] = useState(false);

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
          variant={comment.isLiked ? "secondary" : "ghost"}
          onClick={onLikeButtonClick}
        >
          {comment.likeCount} {comment.isLiked ? `Liked` : "Like"}
        </Button>
        <Button variant="ghost">Reply</Button>
      </div>
    </div>
  );
}
