"use client";

import React, { useState } from "react";
import SideSheet from "./sideSheet";
import { User } from "lucia";
import { logout } from "@/server/auth/action";
import Link from "next/link";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

function ProfileButton() {
  return (
    <SheetTrigger asChild>
      <Button>Profile</Button>
    </SheetTrigger>
  );
}

const HeaderNav = ({ user }: { user: User | null }) => {
  const [isOpen, setIsOpen] = useState(false);

  const profileButton = <ProfileButton />;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <nav className="flex gap-3 items-center">
        {user ? (
          profileButton
        ) : (
          <Link href="/login" className="underlined">
            Login
          </Link>
        )}
      </nav>
      <SideSheet setIsOpen={setIsOpen} />
    </Sheet>
  );
};

export default HeaderNav;
