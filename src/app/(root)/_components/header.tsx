import { auth, signOut } from "@/auth";
import Link from "next/link";
import React from "react";

const Header = async () => {
  const user = await auth();
  return (
    <header className="border-b-2  ">
      <div className="w-full mx-auto container flex justify-between px-2 py-4 items-center">
        <h1 className="text-xl font-semibold">Forum Poster</h1>
        <nav className="flex gap-3 items-center">
          {user ? (
            <form
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <button>Logout</button>
            </form>
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
