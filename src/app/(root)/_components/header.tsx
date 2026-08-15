"use client";

import { useUserStore } from "@/store/userStore";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import SideSheet from "./sideSheet";
import NotificationsButton from "./NotificationsButton";
import { MessagesSquare, Plus, Compass } from "lucide-react";

const Header = () => {
  const { user, isLoading } = useUserStore(({ user, isLoading }) => ({
    user,
    isLoading,
  }));
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-6">
            <Link
              href={user ? "/feed" : "/"}
              className="flex items-center gap-2 font-semibold tracking-tight transition-opacity hover:opacity-90"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <MessagesSquare className="h-4 w-4" />
              </div>
              <span className="text-base font-bold">ForumPost</span>
            </Link>
            {user && (
              <nav className="hidden sm:flex items-center gap-4 text-sm font-medium text-muted-foreground">
                <Link
                  href="/feed"
                  className="flex items-center gap-1.5 transition-colors hover:text-foreground"
                >
                  <Compass className="h-4 w-4" />
                  Feed
                </Link>
                <Link
                  href="/forum/create"
                  className="flex items-center gap-1.5 transition-colors hover:text-foreground"
                >
                  <Plus className="h-4 w-4" />
                  Create Forum
                </Link>
              </nav>
            )}
          </div>

          <div className="flex items-center gap-3">
            <NotificationsButton user={user} isLoading={isLoading} />
            {!isLoading &&
              (user ? (
                <button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  className="flex items-center gap-2 rounded-full ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:opacity-80"
                  aria-label="User menu"
                >
                  <Avatar
                    fallback={user.name || user.username || "U"}
                    className="h-8 w-8 text-xs font-semibold"
                  />
                  <span className="hidden md:inline-block text-sm font-medium">
                    {user.name || user.username}
                  </span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/login">Log in</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/register">Sign up</Link>
                  </Button>
                </div>
              ))}
          </div>
        </div>
      </header>
      <SideSheet isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
};

export default Header;
