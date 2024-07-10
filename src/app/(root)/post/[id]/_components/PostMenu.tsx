"use client";

import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loadingButton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { deletePost } from "@/server/db/actions/post";
import { Post } from "@/server/db/schema/types";
import { useUserStore } from "@/store/userStore";
import { Menu, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PostMenu({ post }: { post: Post }) {
  const router = useRouter();
  const user = useUserStore((v) => v.user);

  const [isDeleting, setIsDeleting] = useState(false);
  return (
    <Popover>
      <PopoverTrigger>
        <MoreHorizontal />
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col">
          {user && user.id === post.posterId && (
            <LoadingButton
              className="mt-2"
              onClick={async () => {
                if (isDeleting) return;
                setIsDeleting(true);
                await deletePost(post.id);
                router.push(`/forum/${post.forumId}`);
              }}
              isLoading={isDeleting}
              loadingText="Deleting..."
            >
              Delete
            </LoadingButton>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
