"use client";
import { useUserStore } from "@/store/userStore";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import SideSheet from "./sideSheet";
import NotificationsButton from "./NotificationsButton";

const Header = () => {
  const { user, isLoading } = useUserStore(({ user, isLoading }) => ({
    user,
    isLoading,
  }));
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className="border-b-2  ">
        <div className="w-full mx-auto container flex justify-between px-2 py-4 items-center">
          <Link href={user ? "/feed" : "/"}>
            <h1 className="text-xl font-semibold">Forum Poster</h1>
          </Link>
          <nav className="flex gap-3 items-center">
            <NotificationsButton user={user} isLoading={isLoading} />
            {!isLoading &&
              (user ? (
                <Button onClick={() => setIsOpen(true)} variant="outline">
                  Profile
                </Button>
              ) : (
                <Link href="/login" className="underlined">
                  Login
                </Link>
              ))}
          </nav>
        </div>
      </header>
      <div className="absolute">
        <SideSheet isOpen={isOpen} setIsOpen={setIsOpen} />
      </div>
    </>
  );
};
export default Header;
