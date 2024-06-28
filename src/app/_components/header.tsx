import Link from "next/link";
import React from "react";

const Header = () => {
  return (
    <header className="border-b border-primary">
      <div className="w-full mx-auto container flex justify-between px- py-4">
        <h1 className="text-xl font-semibold">Forum Poster</h1>
        <nav className="flex gap-3">
          <Link href="/login">Login</Link>
        </nav>
      </div>
    </header>
  );
};
export default Header;
