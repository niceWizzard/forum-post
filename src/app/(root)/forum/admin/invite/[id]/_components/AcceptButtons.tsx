"use client";
import { Button } from "@/components/ui/button";
import { resolveAdminInvite } from "@/server/db/actions/forum";
import { ForumAdmin } from "@/server/db/schema/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function AcceptButtons({
  invite,
  forumId,
}: {
  invite: ForumAdmin;
  forumId: string;
}) {
  const [status, setStatus] = useState<boolean | null>(null);
  const router = useRouter();

  async function onButtonClick(accept: boolean) {
    setStatus(accept);
    const res = await resolveAdminInvite({
      accept,
      forumId,
    });
    setStatus(null);
    if (res.error) {
      toast.error("An error occurred while resolving.", {
        description: res.message,
      });
      return;
    }
    toast.success("You are now a forum admin!");
    router.push(`/forum/${forumId}`);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2 my-4">
      <Button
        onClick={() => onButtonClick(true)}
        variant="secondary"
        disabled={status != null}
      >
        {status == null ? "Accept" : status ? "Accepting..." : "Accept"}
      </Button>
      <Button
        onClick={() => onButtonClick(false)}
        variant="destructive"
        disabled={status != null}
      >
        {status == null ? "Reject" : !status ? "Rejecting..." : "Reject"}
      </Button>
    </div>
  );
}
