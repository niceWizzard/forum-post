import { logout, validateRequest } from "@/server/auth/action";
import Link from "next/link";

const Header = async () => {
  const { user } = await validateRequest();
  return (
    <header className="border-b-2  ">
      <div className="w-full mx-auto container flex justify-between px-2 py-4 items-center">
        <h1 className="text-xl font-semibold">Forum Poster</h1>
        <pre>{JSON.stringify(user, null, 2)}</pre>
        <nav className="flex gap-3 items-center">
          {user ? (
            <form action={logout}>
              <button type="submit">Logout</button>
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
