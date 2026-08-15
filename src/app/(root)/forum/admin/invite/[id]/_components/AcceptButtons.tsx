"use client";

import { Button } from "@/components/ui/button";
import { resolveAdminInvite } from "@/server/db/actions/forum";
import { ForumAdmin } from "@/server/db/schema/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Check, X, Loader2 } from "lucide-react";

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
      toast.error("Could not process invitation", {
        description: res.message,
      });
      return;
    }
    if (accept) {
      toast.success("You are now a moderator of this community!");
      router.push(`/forum/${forumId}`);
    } else {
      toast.info("Moderator invitation declined");
      router.push("/feed");
    }
  }

  return (
    <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
      <Button
        onClick={() => onButtonClick(true)}
        disabled={status !== null}
        size="sm"
        className="gap-1.5"
      >
        {status === true ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Accepting...
          </>
        ) : (
          <>
            <Check className="h-3.5 w-3.5" /> Accept Invitation
          </>
        )}
      </Button>
      <Button
        onClick={() => onButtonClick(false)}
        variant="outline"
        disabled={status !== null}
        size="sm"
        className="gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
      >
        {status === false ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Declining...
          </>
        ) : (
          <>
            <X className="h-3.5 w-3.5" /> Decline
          </>
        )}
      </Button>
    </div>
  );
}
