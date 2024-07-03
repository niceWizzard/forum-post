import { getUserProfile } from "@/server/db/queries/user";

interface Props {
  params: { id: string };
}

async function ProfilePage({ params: { id } }: Props) {
  const profile = await getUserProfile(id);

  return (
    <div>
      <p>Profile Page {profile.user?.name ?? "Not found"}</p>
      <pre>{JSON.stringify(profile, null, 2)}</pre>
    </div>
  );
}

export default ProfilePage;
