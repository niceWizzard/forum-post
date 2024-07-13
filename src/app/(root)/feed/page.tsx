import { authenticatedOnly } from "@/server/auth/validate";
import { getCreatedForums, getTrendingForums } from "@/server/db/queries/forum";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function FeedPage() {
  const { user } = await authenticatedOnly();

  const res = await getCreatedForums(user.id);
  const trendingForum = await getTrendingForums();
  if (res.error) {
    return res.message;
  }

  if (trendingForum.error) return trendingForum.message;

  const createdForums = res.data;

  return (
    <section>
      <h3>Trending forums</h3>
      <div className="flex flex-col gap-3">
        {trendingForum.data.map((forum) => (
          <Link key={forum.id} href={`/forum/${forum.id}`}>
            <div className="flex flex-col items-center bg-card px-4 py-2">
              <span className="font-medium text-foreground-lighter text-sm">
                {forum.name}
              </span>
              <span className="ml-2 text-foreground-lighter text-sm text-gray-400">
                {forum.forumMembersCount} members
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
