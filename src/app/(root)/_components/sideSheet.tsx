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
import { useUserStore } from "@/store/userStore";
import Link from "next/link";

export default function SideSheetContent() {
  const user = useUserStore((v) => v.user);

  if (!user) {
    return null;
  }

  return (
    <SheetContent>
      <div className="flex flex-col gap-4 py-4  h-full">
        <div className="profile-side-sheet border-b border-gray-400 pb-4">
          <div className="w-12 h-12 bg-white rounded-full item-a"></div>
          <h2 className="text-xl font-bold item-b">{user.name}</h2>
          <div className="text-md font-medium text-gray-400 item-c flex gap-2">
            <span>@{user.username}</span>
            <Link href={`/profile/${user.id}`}>View Profile</Link>
          </div>
        </div>
      </div>
    </SheetContent>
  );
}
