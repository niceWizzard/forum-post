"use client";
import { auth } from "@/auth";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";
import { signOutAction } from "@/auth/action";

const Header = () => {
  const { data: user, status } = useSession();
  return (
    <header className="border-b-2  ">
      <div className="w-full mx-auto container flex justify-between px-2 py-4 items-center">
        <h1 className="text-xl font-semibold">Forum Poster</h1>
        <span>{status}</span>
        <nav className="flex gap-3 items-center">
          {user ? (
            <button
              onClick={async () => {
                await signOutAction();
                location.reload();
              }}
            >
              Logout
            </button>
          ) : (
            <Link href="/login" className="underlined">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};
export default Header;
