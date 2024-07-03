"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { logout } from "@/server/auth/action";
import { useUserStore } from "@/store/userStore";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const SideSheet = ({
  setIsOpen,
  isOpen,
}: {
  setIsOpen: (a: boolean) => void;
  isOpen: boolean;
}) => {
  const { user, clearUser } = useUserStore(({ user, clearUser }) => ({
    user,
    clearUser,
  }));

  if (!user) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen} modal>
      <SheetTitle className="sr-only">Side navigation</SheetTitle>
      <SheetDescription className="sr-only">
        Profile navigation
      </SheetDescription>
      <SheetTrigger className="hidden aria-hidden"></SheetTrigger>
      <SheetContent>
        <div className="flex flex-col gap-4 py-4  h-full">
          <div className="profile-side-sheet border-b border-gray-400 pb-4">
            <div className="w-12 h-12 bg-white rounded-full item-a"></div>
            <h2 className="text-md md:text-xl font-bold item-b">{user.name}</h2>
            <div className="text-sm md:text-md font-medium text-gray-400 item-c flex gap-2">
              <span>@{user.username}</span>
              <Link
                href={`/profile/${user.id}`}
                onClickCapture={() => {
                  setIsOpen(false);
                }}
              >
                View Profile
              </Link>
            </div>
          </div>
          <LogoutButton
            onLogout={() => {
              console.log("CLEARING USER");
              clearUser();
              setIsOpen(false);
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

function LogoutButton({ onLogout }: { onLogout: () => void }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  return (
    <Button
      variant="destructive"
      disabled={isLoggingOut}
      onClick={async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);
        await logout();
        onLogout();
      }}
    >
      {isLoggingOut ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Logging out
        </>
      ) : (
        "Log out"
      )}
    </Button>
  );
}

export default SideSheet;
