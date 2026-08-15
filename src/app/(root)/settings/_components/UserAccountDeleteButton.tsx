"use client";

import { LoadingButton } from "@/components/ui/loadingButton";
import { deleteUserAccount } from "@/server/db/actions/user";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export default function UserAccountDeleteButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const clearUser = useUserStore((v) => v.clearUser);

  return (
    <LoadingButton
      variant="destructive"
      size="sm"
      className="gap-2 font-medium"
      isLoading={isLoading}
      loadingText="Deleting account..."
      onClick={async () => {
        const confirmed = window.confirm(
          "Are you absolutely sure you want to permanently delete your account? All your posts, comments, and memberships will be affected."
        );
        if (!confirmed) return;

        setIsLoading(true);
        const res = await deleteUserAccount();
        setIsLoading(false);
        if (res.error) {
          toast.error("Could not delete account", {
            description: res.message,
          });
          return;
        }
        clearUser();
        toast.success("Your account has been deleted");
        router.push("/");
      }}
    >
      <Trash2 className="h-4 w-4" />
      <span>Delete Account</span>
    </LoadingButton>
  );
}
