"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { asSortOrder, asSortType, SortType } from "@/server/db/schema/types";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SortButton({ forumId }: { forumId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sortType = asSortType(searchParams.get("sort"));
  const sortOrder = asSortOrder(searchParams.get("order"));
  const [open, setOpen] = useState(false);

  function onSortButtonClick(s: SortType) {
    const newSearchParams = new URLSearchParams(
      Array.from(searchParams.entries())
    );
    if (s === newSearchParams.get("sort")) {
      newSearchParams.set("order", sortOrder === "down" ? "up" : "down");
    } else {
      newSearchParams.delete("order");
    }
    newSearchParams.set("sort", s);
    router.push(`${pathname}?${newSearchParams.toString()}`);
    setOpen(false);
  }

  const currentLabel =
    sortType === "likes"
      ? sortOrder === "up"
        ? "Least Liked"
        : "Most Liked"
      : sortOrder === "up"
      ? "Oldest"
      : "Newest";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs font-normal">
          <ArrowUpDown className="h-3.5 w-3.5" />
          <span>{currentLabel}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-48 p-1.5 border-border">
        <div className="flex flex-col gap-1">
          <Button
            variant={sortType === "newest" ? "secondary" : "ghost"}
            size="sm"
            className="justify-between text-xs h-8 font-normal"
            onClick={() => onSortButtonClick("newest")}
          >
            <span>Date ({sortType === "newest" && sortOrder === "up" ? "Oldest" : "Newest"})</span>
            {sortType === "newest" &&
              (sortOrder === "up" ? (
                <ArrowUp className="h-3.5 w-3.5" />
              ) : (
                <ArrowDown className="h-3.5 w-3.5" />
              ))}
          </Button>
          <Button
            variant={sortType === "likes" ? "secondary" : "ghost"}
            size="sm"
            className="justify-between text-xs h-8 font-normal"
            onClick={() => onSortButtonClick("likes")}
          >
            <span>Likes ({sortType === "likes" && sortOrder === "up" ? "Lowest" : "Highest"})</span>
            {sortType === "likes" &&
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
