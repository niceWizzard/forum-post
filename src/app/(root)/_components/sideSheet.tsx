"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { logout } from "@/server/auth/action";
import { useUserStore } from "@/store/userStore";
import { Loader2, LogOut, PlusCircle, Settings, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

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
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side="right"
        className="w-80 sm:w-96 flex flex-col p-6 border-l border-border bg-card"
        onClickCapture={(e) => {
          if (e.target instanceof HTMLAnchorElement) {
            setIsOpen(false);
          }
        }}
      >
        <SheetHeader className="text-left space-y-1">
          <SheetTitle className="text-base font-semibold">Account</SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Manage your account and navigation
          </SheetDescription>
        </SheetHeader>

        <div className="flex items-center gap-3 py-4 my-2 rounded-lg border border-border bg-background p-3">
          <Avatar
            fallback={user.name || user.username || "U"}
            className="h-11 w-11 text-sm font-semibold"
          />
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-semibold truncate leading-snug">
              {user.name || "Anonymous"}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              @{user.username || "nousername"}
            </span>
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          <Button
            asChild
            variant="ghost"
            className="justify-start gap-2.5 h-10 px-3 font-normal"
          >
            <Link href={`/profile/${user.id}`}>
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              <span>View Profile</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            className="justify-start gap-2.5 h-10 px-3 font-normal"
          >
            <Link href="/forum/create">
              <PlusCircle className="h-4 w-4 text-muted-foreground" />
              <span>Create a Forum</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            className="justify-start gap-2.5 h-10 px-3 font-normal"
          >
            <Link href="/settings">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span>Settings</span>
            </Link>
          </Button>
        </nav>

        <Separator className="my-3" />

        <LogoutButton
          onLogout={() => {
            clearUser();
            setIsOpen(false);
          }}
        />
      </SheetContent>
    </Sheet>
  );
};

function LogoutButton({ onLogout }: { onLogout: () => void }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  return (
    <Button
      variant="destructive"
      size="sm"
      className="w-full justify-center gap-2"
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
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Logging out...</span>
        </>
      ) : (
        <>
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </>
      )}
    </Button>
  );
}

export default SideSheet;
