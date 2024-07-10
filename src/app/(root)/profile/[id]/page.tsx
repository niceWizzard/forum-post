import { getUserProfile } from "@/server/db/queries/user";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

interface Props {
  params: { id: string };
}

export const revalidate = 60;

async function ProfilePage({ params: { id } }: Props) {
  const profileRes = await getUserProfile(id);

  if (profileRes.error) {
    return profileRes.message;
  }

  const profile = profileRes.data;

  return (
    <section className="py-12">
      <div className="container px-2 sm:px-4">
        <h2>Profile Page {profile.user?.name ?? "Not found"}</h2>
        <div className="flex flex-col gap-4">
          {profile.createdForums.map((forum) => (
            <Link key={forum.id} href={`/forum/${forum.id}`}>
              <div className="bg-card px-2  md:px-4 py-2 grid-cols-[1fr,auto] grid grid-rows-1 border border-foreground-lighter rounded-sm ">
                <h3 className="text-lg font-semibold row-span-1 col-span-2">
                  {forum.name}
                </h3>
                <p className="text-md font-light text-foreground-light row-span-1 col-span-1 text-ellipsis overflow-hidden">
                  {forum.description}
                </p>
                <ArrowRightIcon className="row-span-2 col-span-1 " />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProfilePage;
