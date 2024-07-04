import { getForumById, getForumPosts } from "@/server/db/queries/forum";
import { Forum, Post } from "@/server/db/schema/types";
import Link from "next/link";

interface Props {
  params: { id: string };
}

const ForumWithIdPage = async ({ params: { id } }: Props) => {
  const forum = await getForumById(id);
  if (!forum) {
    return "Invalid forum";
  }

  const posts = await getForumPosts(id);

  return (
    <section className="flex flex-col min-h-[80vh]">
      <ForumHeader forum={forum} />
      <ForumContent posts={posts} forumId={forum.id} />
    </section>
  );
};

export default ForumWithIdPage;

function ForumContent({ posts, forumId }: { posts: Post[]; forumId: string }) {
  return (
    <div className="px-4 py-6 flex flex-col  flex-grow">
      <Link
        href={`/post/create/${forumId}`}
        className="border border-secondary rounded-md px-3 py-2 self-end"
      >
        Post something
      </Link>
      <div className="container h-full mt-6">
        <div className="flex flex-col h-full gap-4">
          {posts.map((post) => (
            <Link href={`/post/${post.id}`} key={post.id}>
              <div className="px-4 py-2 overflow-hidden border border-gray-500 rounded-lg">
                <h3 className="font-semibold text-lg ">{post.title}</h3>
                <p className="text-ellipsis text-foreground-light font-light text-sm">
                  {post.body}
                </p>
              </div>
            </Link>
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
    <div className="bg-card pt-12 pb-6 px-4 overflow-hidden break-words whitespace-normal">
      <div className="container gap-6 flex flex-col ">
        <div className="row-span-2 flex gap-4 items-center">
          <h3 className="text-xl font-semibold flex-grow">{forum.name}</h3>
          <span className="">500k members</span>
          <button className="row-span-1">Join now</button>
        </div>
        <p className="text-sm font-light text-foreground-lighter row-span-1 col-span-1 text-ellipsis ">
          {forum.description || "nothing to see here... :)"}
        </p>
      </div>
    </div>
  );
}
