"use client";

import { LoadingButton } from "@/components/ui/loadingButton";
import { deleteUserAccount } from "@/server/db/actions/user";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function UserAccountDeleteButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const clearUser = useUserStore((v) => v.clearUser);
  return (
    <LoadingButton
      variant="destructive"
      isLoading={isLoading}
      onClick={async () => {
        setIsLoading(true);
        const res = await deleteUserAccount();
        setIsLoading(false);
        if (res.error) {
          toast.error("An error occurred while deleting your account", {
            description: res.message,
          });
          return;
        }
        clearUser();
        toast.success("Account deleted successfully!");
        // Navigate to the homepage
        router.push("/");
      }}
    >
      Delete your account
    </LoadingButton>
  );
}
