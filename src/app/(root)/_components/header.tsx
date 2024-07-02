import { validateRequest } from "@/server/auth/action";
import HeaderNav from "./headerNav";

const Header = async () => {
  const { user } = await validateRequest();
  return (
    <header className="border-b-2  ">
      <div className="w-full mx-auto container flex justify-between px-2 py-4 items-center">
        <h1 className="text-xl font-semibold">Forum Poster</h1>
        <HeaderNav user={user} />
      </div>
    </header>
  );
};
export default Header;
