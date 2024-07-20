"use client";

import { LoadingButton } from "@/components/ui/loadingButton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import SignedIn from "@/components/utils/SignedIn";
import { deleteForum } from "@/server/db/actions/forum";
import { Forum } from "@/server/db/schema/types";
import { useUserStore } from "@/store/userStore";
import { Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AssignAdminDialog } from "./admin/AssignAdminDialog";

export default function ForumSettings({ forum }: { forum: Forum }) {
  const user = useUserStore((v) => v.user);
  const [isDeletingForum, setisDeletingForum] = useState(false);
  const router = useRouter();
  if (!user || (!forum.isOwner && !forum.isAdmin)) return null;

  async function onDeleteForum() {
    setisDeletingForum(true);
    const res = await deleteForum(forum.id);
    setisDeletingForum(false);
    if (res.error) {
      toast.error("An error occurred while deleting the forum", {
        description: res.message,
      });
      return;
    }
    toast.success("Forum deleted successfully", {
      description: "Your forum has been deleted",
    });
    router.push("/feed");
  }
  return (
    <Popover>
      <PopoverTrigger>
        <Settings />
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-2">
          <SignedIn>
            {forum.isOwner && (
              <LoadingButton
                isLoading={isDeletingForum}
                loadingText="Deleting..."
                onClick={onDeleteForum}
              >
                Delete forum
              </LoadingButton>
            )}
            {(forum.isOwner || forum.isAdmin) && (
              <AssignAdminDialog forumId={forum.id} />
            )}
          </SignedIn>
        </div>
      </PopoverContent>
    </Popover>
  );
}
