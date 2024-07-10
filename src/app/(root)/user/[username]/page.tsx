import { getUserByUsername } from "@/server/db/queries/user";
import { redirect } from "next/navigation";

export default async function UsernamePage({
  params: { username },
}: {
  params: { username: string };
}) {
  const res = await getUserByUsername(username);
  if (res.error) {
    return res.message;
  }

  const user = res.data;

  if (!user) {
    return (
      <section>
        <h1>User not found</h1>
      </section>
    );
  }

  redirect(`/profile/${user.id}`);
}
