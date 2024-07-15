"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { asSortOrder, asSortType, SortType } from "@/server/db/schema/types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function SortButton({ forumId }: { forumId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sortType = asSortType(searchParams.get("sort"));
  const sortOrder = asSortOrder(searchParams.get("order"));

  function onSortButtonClick(s: SortType) {
    const newSearchParams = new URLSearchParams(
      Array.from(searchParams.entries())
    );
    if (s == newSearchParams.get("sort")) {
      newSearchParams.set("order", sortOrder == "down" ? "up" : "down");
    } else {
      newSearchParams.delete("order");
    }
    newSearchParams.set("sort", s);
    router.push(`${pathname}?${newSearchParams.toString()}`);
  }
  return (
    <Popover>
      <PopoverTrigger>Sort</PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-2">
          <Button
            variant={sortType == "newest" ? "default" : "ghost"}
            onClick={() => onSortButtonClick("newest")}
          >
            {sortType == "newest"
              ? sortOrder == "down"
                ? "Newest"
                : "Oldest"
              : "By date"}
          </Button>
          <Button
            variant={sortType == "likes" ? "default" : "ghost"}
            onClick={() => onSortButtonClick("likes")}
          >
            {sortType == "likes"
              ? sortOrder == "down"
                ? "Most Likes"
                : "Least likes"
              : "By likes"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
