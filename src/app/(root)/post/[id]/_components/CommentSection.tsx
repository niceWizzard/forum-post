"use client";

import {
  asSortOrder,
  asSortType,
  type Comment,
  PostWithComments,
  ReplyComment,
  SortOrder,
  SortType,
} from "@/server/db/schema/types";
import { CommentForm } from "./CommentForm";
import { Button } from "@/components/ui/button";
import { formatDistance } from "date-fns";
import Link from "next/link";
import { deleteComment, toggleLikeComment } from "@/server/db/actions/comment";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";
import { useUserStore } from "@/store/userStore";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  ReadonlyURLSearchParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { env } from "@/env/client.mjs";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ArrowDown, ArrowUp, Heart, ThumbsUp } from "lucide-react";
import { ApiResponse } from "@/server/apiResponse";

interface Props {
  post: PostWithComments;
  pageNumber: number;
}

export default function CommentSection({ post, pageNumber }: Props) {
  return (
    <section className="">
      <div className="border-b pb-2 flex justify-between">
        <h4>{post.commentCount} Comments</h4>
        <CommentSortButton />
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

function CommentSortButton() {
  const searchParams = useSearchParams();
  const sortRaw = searchParams.get("sort")?.toLowerCase();
  const sort = asSortType(sortRaw);
  const sortOrder = asSortOrder(searchParams.get("order")?.toLowerCase());
  const router = useRouter();
  const pathName = usePathname();

  const [isOpen, setIsOpen] = useState(false);

  function onSortButtonClick(val: SortType): void {
    const currentParams = new URLSearchParams(
      Array.from(searchParams.entries())
    );
    currentParams.set("sort", val);
    if (sort == val) {
      currentParams.set("order", sortOrder == "down" ? "up" : "down");
    }
    currentParams.delete("commentPage");
    router.push(`${pathName}?${currentParams.toString()}`);
    setIsOpen(false);
  }
  return (
    <Popover open={isOpen} onOpenChange={(v) => setIsOpen(v)}>
      <PopoverTrigger>Sort</PopoverTrigger>
      <PopoverContent>
        <div className="flex gap-2 flex-col">
          <Button
            variant={sort == "newest" ? "default" : "ghost"}
            onClick={() => onSortButtonClick("newest")}
            className="flex  items-center gap-3 justify-start"
          >
            <span className="flex-grow text-start">
              {sort == "newest"
                ? sortOrder == "down"
                  ? "Newest"
                  : "Oldest"
                : "Date"}
            </span>

            {sort == "newest" &&
              (sortOrder == "up" ? <ArrowUp /> : <ArrowDown />)}
          </Button>
          <Button
            variant={sort == "likes" ? "default" : "ghost"}
            onClick={() => onSortButtonClick("likes")}
            className="flex  items-center gap-3 justify-start"
          >
            <span className="flex-grow text-start">
              {sort == "likes"
                ? sortOrder == "up"
                  ? "Least likes"
                  : "Most likes"
                : "Likes"}
            </span>
            {sort == "likes" &&
              (sortOrder == "up" ? <ArrowUp /> : <ArrowDown />)}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

const toUrlPath = (
  pageNum: number,
  searchParams: ReadonlyURLSearchParams,
  path: string
): string => {
  const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
  currentParams.set("commentPage", String(pageNum));
  return `${path}?${currentParams.toString()}`;
};

function PaginationRow({ post, pageNumber }: Props) {
  const totalCommentPages = Math.ceil(post.commentCount / 10);
  // const [prevPageHref, setPrevPageHref] = useState("");
  const path = usePathname();
  const searchParams = useSearchParams();

  const prevPageHref = useMemo(() => {
    return pageNumber == 1
      ? "#"
      : toUrlPath(pageNumber - 1, searchParams, path);
  }, [pageNumber, path, searchParams]);

  const nextPageHref = useMemo(() => {
    return pageNumber == totalCommentPages
      ? "#"
      : toUrlPath(pageNumber + 1, searchParams, path);
  }, [pageNumber, path, searchParams, totalCommentPages]);

  return (
    <Pagination className="mt-3">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href={prevPageHref} />
        </PaginationItem>
        {...new Array(totalCommentPages).fill(1).map((v, i) => (
          <PaginationItem key={`page-${i}`}>
            <PaginationLink
              href={toUrlPath(i + 1, searchParams, path)}
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
