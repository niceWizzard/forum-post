"use client";
import Link from "next/link";
import React from "react";

const Header = () => {
  return (
    <header className="border-b-2  ">
      <div className="w-full mx-auto container flex justify-between px-2 py-4 items-center">
        <h1 className="text-xl font-semibold">Forum Poster</h1>
        <span>{status}</span>
        <nav className="flex gap-3 items-center">
          <Link href="/login" className="underlined">
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
};
export default Header;
