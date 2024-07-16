import { getAuth } from "@/server/auth";
import ClientProvider from "./ClientProvider";
import UserStoreProvider from "./storeProvider";

export default async function MyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getAuth();

  return (
    <ClientProvider>
      <UserStoreProvider initialState={user} />
      {children}
    </ClientProvider>
  );
}
