"use client";

import { LoadingButton } from "@/components/ui/loadingButton";
import { joinForum, leaveForum } from "@/server/db/actions/forum";
import { Forum } from "@/server/db/schema/types";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Check, Plus } from "lucide-react";

export default function JoinButton({ forum }: { forum: Forum }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  return (
    <LoadingButton
      size="sm"
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
        toast.success(
          forum.isJoined
            ? `Left ${forum.name}`
            : `Joined ${forum.name}!`
        );
        router.refresh();
      }}
      variant={forum.isJoined ? "secondary" : "default"}
      className="gap-1.5 font-medium"
    >
      {forum.isJoined ? (
        <>
          <Check className="h-3.5 w-3.5" /> Joined
        </>
      ) : (
        <>
          <Plus className="h-3.5 w-3.5" /> Join
        </>
      )}
    </LoadingButton>
  );
}
