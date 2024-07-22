import { authenticatedOnly } from "@/server/auth/validate";
import { getForumAdminInvite, getForumById } from "@/server/db/queries/forum";

export default async function ForumAdminInvitePage({
  params: { id },
}: {
  params: { id?: string };
}) {
  if (!id) {
    return "Invalid forum id";
  }
  const user = await authenticatedOnly();
  const forumRes = await getForumById(id);
  if (forumRes.error) {
    return forumRes.message;
  }

  const adminRes = await getForumAdminInvite(id);
  if (adminRes.error) {
    return adminRes.message;
  }

  const invite = adminRes.data;
  return <pre>{JSON.stringify(invite, null, 2)}</pre>;
}
