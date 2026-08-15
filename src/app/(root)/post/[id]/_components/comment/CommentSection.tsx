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
import { ArrowDown, ArrowUp, ArrowUpDown, MessageSquare } from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h2 className="text-base font-semibold tracking-tight flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <span>Comments ({post.commentCount})</span>
        </h2>
        <CommentSortButton />
      </div>

      <CommentForm post={post} />

      <div className="space-y-4 divide-y divide-border/60">
        {post.initialComments.map((v) => (
          <div key={v.id} className="pt-4 first:pt-0">
            <Comment comment={v} utils={utils} />
          </div>
        ))}

        {post.initialComments.length === 0 && (
          <div className="py-12 text-center text-xs text-muted-foreground">
            No comments yet. Join the conversation and share your thoughts!
          </div>
        )}
      </div>

      {post.commentCount > 10 && (
        <PaginationRow post={post} pageNumber={pageNumber} />
      )}
    </div>
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
    if (sort === val) {
      currentParams.set("order", sortOrder === "down" ? "up" : "down");
    }
    currentParams.delete("commentPage");
    router.push(`${pathName}?${currentParams.toString()}`);
    setIsOpen(false);
  }

  const currentLabel =
    sort === "likes"
      ? sortOrder === "up"
        ? "Least Liked"
        : "Most Liked"
      : sortOrder === "up"
      ? "Oldest"
      : "Newest";

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs font-normal h-8">
          <ArrowUpDown className="h-3 w-3" />
          <span>{currentLabel}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-44 p-1.5 border-border">
        <div className="flex gap-1 flex-col">
          <Button
            variant={sort === "newest" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onSortButtonClick("newest")}
            className="flex items-center justify-between text-xs h-8 font-normal"
          >
            <span>Date ({sort === "newest" && sortOrder === "up" ? "Oldest" : "Newest"})</span>
            {sort === "newest" &&
              (sortOrder === "up" ? (
                <ArrowUp className="h-3.5 w-3.5" />
              ) : (
                <ArrowDown className="h-3.5 w-3.5" />
              ))}
          </Button>
          <Button
            variant={sort === "likes" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onSortButtonClick("likes")}
            className="flex items-center justify-between text-xs h-8 font-normal"
          >
            <span>Likes ({sort === "likes" && sortOrder === "up" ? "Lowest" : "Highest"})</span>
            {sort === "likes" &&
              (sortOrder === "up" ? (
                <ArrowUp className="h-3.5 w-3.5" />
              ) : (
                <ArrowDown className="h-3.5 w-3.5" />
              ))}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
