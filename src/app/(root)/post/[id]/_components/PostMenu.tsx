"use client";

import { LoadingButton } from "@/components/ui/loadingButton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { deletePost } from "@/server/db/actions/post";
import { Post } from "@/server/db/schema/types";
import { useUserStore } from "@/store/userStore";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function PostMenu({ post }: { post: Post }) {
  const router = useRouter();
  const user = useUserStore((v) => v.user);
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  const canDelete =
    user &&
    (user.id === post.posterId ||
      post.forum?.isOwner ||
      post.forum?.isAdmin);

  if (!canDelete) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-48 p-1.5 border-border shadow-md">
        <LoadingButton
          variant="ghost"
          size="sm"
          className="w-full justify-start text-xs font-normal text-destructive hover:bg-destructive/10 hover:text-destructive gap-2 h-8"
          onClick={async () => {
            if (isDeleting) return;
            setIsDeleting(true);
            const res = await deletePost(post.id);
            if (res.error) {
              setIsDeleting(false);
              toast.error("Could not delete post", {
                description: res.message,
              });
              return;
            }
            toast.success("Post deleted successfully");
            setOpen(false);
            router.push(`/forum/${post.forumId}`);
          }}
          isLoading={isDeleting}
          loadingText="Deleting..."
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete Post</span>
        </LoadingButton>
      </PopoverContent>
    </Popover>
  );
}
