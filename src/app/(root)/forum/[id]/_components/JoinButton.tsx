"use client";

import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loadingButton";
import { cn } from "@/lib/utils";
import { joinForum, leaveForum } from "@/server/db/actions/forum";
import { Forum } from "@/server/db/schema/types";
import clsx from "clsx";
import { useState } from "react";
import { toast } from "sonner";

export default function JoinButton({ forum }: { forum: Forum }) {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <LoadingButton
      isLoading={isLoading}
      onClick={async () => {
        if (isLoading) return;
        const action = forum.isJoined ? leaveForum : joinForum;
        setIsLoading(true);
        const res = await action(forum.id);
        setIsLoading(false);
        if (res.error) {
          toast.error("An error occurred", {
            description: res.message,
          });
          return;
        }
      }}
      variant={forum.isJoined ? "destructive" : "default"}
    >
      {forum.isJoined ? "Leave" : "Join"}
    </LoadingButton>
  );
}
