import { authenticatedOnly } from "@/server/auth/validate";
import { getForumAdminInvite, getForumById } from "@/server/db/queries/forum";
import { redirect } from "next/navigation";
import AcceptButtons from "./_components/AcceptButtons";

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
  if (invite.status !== "pending") {
    redirect(`/forum/${id}`);
  }
  return (
    <section className="w-full h-full py-6">
      <div className="container flex flex-col">
        <h3 className="text-lg font-semibold">
          You are invited to be an admin of {forumRes.data.name}
        </h3>
        <p className="text-sm font-light text-foreground-lighter">
          To accept the invite, click the button below:
        </p>
        <AcceptButtons invite={invite} forumId={forumRes.data.id} />
      </div>
    </section>
  );
}
