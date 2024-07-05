import { authenticatedOnly } from "@/server/auth/validate";
import { getCreatedForums } from "@/server/db/queries/forum";
import { redirect } from "next/navigation";

export default async function FeedPage() {
  const { user } = await authenticatedOnly();

  const res = await getCreatedForums(user.id);
  if (res.error) {
    return res.message;
  }

  const createdForums = res.data;

  return (
    <div>
      <pre>{JSON.stringify(createdForums, null, 2)}</pre>
    </div>
  );
}
