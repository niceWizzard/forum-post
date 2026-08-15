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
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AssignAdminDialog } from "./admin/AssignAdminDialog";
import { Button } from "@/components/ui/button";

export default function ForumSettings({ forum }: { forum: Forum }) {
  const user = useUserStore((v) => v.user);
  const [isDeletingForum, setIsDeletingForum] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  if (!user || (!forum.isOwner && !forum.isAdmin)) return null;

  async function onDeleteForum() {
    setIsDeletingForum(true);
    const res = await deleteForum(forum.id);
    setIsDeletingForum(false);
    if (res.error) {
      toast.error("Could not delete forum", {
        description: res.message,
      });
      return;
    }
    toast.success("Community deleted successfully");
    setOpen(false);
    router.push("/feed");
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-2 border-border shadow-md">
        <div className="flex flex-col gap-1">
          <SignedIn>
            {(forum.isOwner || forum.isAdmin) && (
              <AssignAdminDialog forumId={forum.id} />
            )}
            {forum.isOwner && (
              <LoadingButton
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs font-normal text-destructive hover:bg-destructive/10 hover:text-destructive gap-2 h-8"
                isLoading={isDeletingForum}
                loadingText="Deleting..."
                onClick={onDeleteForum}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Community</span>
              </LoadingButton>
            )}
          </SignedIn>
        </div>
      </PopoverContent>
    </Popover>
  );
}
