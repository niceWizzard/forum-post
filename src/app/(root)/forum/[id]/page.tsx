import { getForumById, getForumPosts } from "@/server/db/queries/forum";
import {
  asSortOrder,
  asSortType,
  type Forum,
  type Post,
} from "@/server/db/schema/types";
import Link from "next/link";
import PostPreview from "./_components/PostPreview";
import JoinButton from "./_components/JoinButton";
import ForumSettings from "./_components/ForumSettings";
import SortButton from "./_components/SortButton";
import { Metadata, ResolvingMetadata } from "next";
import Page from "./loading";
import { formatter } from "@/lib/utils";

interface Props {
  params: { id: string };
  searchParams: { sort?: string; order?: string };
}

export async function generateMetadata({
  params: { id },
}: Props): Promise<Metadata> {
  const res = await getForumById(id);
  if (res.error) {
    throw new Error(res.message);
  }
  const forum = res.data;
  return {
    title: `${forum.name} - Forum Post`,
    description: forum.description,
  };
}

export const dynamic = "force-dynamic";

const ForumWithIdPage = async ({
  params: { id },
  searchParams: { order, sort },
}: Props) => {
  const res = await getForumById(id);
  if (res.error) {
    return res.message;
  }

  const forum = res.data;

  const sortType = asSortType(sort);
  const sortOrder = asSortOrder(order);

  const postsRes = await getForumPosts({
    forumId: id,
    sortOrder,
    sortType,
  });

  if (postsRes.error) {
    return postsRes.message;
  }

  return (
    <section className="flex flex-col min-h-[80vh]">
      <ForumHeader forum={forum} />
      <ForumContent posts={postsRes.data} forumId={forum.id} />
    </section>
  );
};

export default ForumWithIdPage;

function ForumContent({ posts, forumId }: { posts: Post[]; forumId: string }) {
  return (
    <div className="px-2 py-6 flex flex-col  flex-grow">
      <div className="self-end flex gap-2">
        <Link
          href={`/post/create/${forumId}`}
          className="border border-secondary rounded-md px-3 py-2"
        >
          Create a Post
        </Link>
        <SortButton forumId={forumId} />
      </div>
      <div className="h-full mt-6">
        <div className="flex flex-col h-full divide-y divide-foreground-lighter ">
          {posts.map((post) => (
            <PostPreview post={post} key={post.id} />
          ))}
          {!posts.length && (
            <span className="text-center">
              No posts yet..{" "}
              <Link href={`/post/create/${forumId}`} className="text-primary">
                Create now
              </Link>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ForumHeader({ forum }: { forum: Forum }) {
  return (
    <div className="bg-card pt-12 pb-6 px-2 overflow-hidden break-words whitespace-normal">
      <div className="container gap-6 flex flex-col ">
        <div className="row-span-2 flex gap-4 items-center">
          <h3 className="text-xl font-semibold flex-grow">{forum.name}</h3>
          <span className="">
            {formatter.format(forum.forumMembersCount)} members
          </span>
          <JoinButton forum={forum} />
          <ForumSettings forum={forum} />
        </div>
        <p className="text-sm font-light text-foreground-lighter row-span-1 col-span-1 text-ellipsis ">
          {forum.description || "nothing to see here... :)"}
        </p>
      </div>
    </div>
  );
}
