"use client";

import {
  asSortOrder,
  asSortType,
  PostWithComments,
  SortType,
} from "@/server/db/schema/types";
import { CommentForm } from "./CommentForm";
import { Button } from "@/components/ui/button";
import { useState } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ArrowDown, ArrowUp } from "lucide-react";
import { PaginationRow } from "../PaginationRow";
import { Comment } from "./Comment";
import { trpc } from "@/app/_trpc/client";

interface Props {
  post: PostWithComments;
  pageNumber: number;
}

export default function CommentSection({ post, pageNumber }: Props) {
  const utils = trpc.useUtils();
  return (
    <section className="">
      <div className="border-b pb-2 flex justify-between">
        <h4>{post.commentCount} Comments</h4>
        <CommentSortButton />
      </div>
      <CommentForm post={post} />
      <div className="flex flex-col gap-3 divide-y divide-foreground-lighter">
        {post.initialComments.map((v) => (
          <Comment comment={v} key={v.id} utils={utils} />
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
