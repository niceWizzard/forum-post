import UserStoreProvider from "./storeProvider";
import { getAuth } from "@/server/auth";

export default async function ServerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getAuth();
  return (
    <>
      <UserStoreProvider initialState={user} />
      {children}
    </>
  );
}
