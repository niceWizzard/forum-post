import { getForumById, getForumPosts } from "@/server/db/queries/forum";
import { forumTable, postTable } from "@/server/db/schema";
import { InferSelectModel } from "drizzle-orm";

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
      <ForumContent posts={posts} />
    </section>
  );
};

export default ForumWithIdPage;

type Forum = InferSelectModel<typeof forumTable>;
type Post = InferSelectModel<typeof postTable>;

function ForumContent({ posts }: { posts: Post[] }) {
  return (
    <div className="px-4 py-6  flex-grow">
      <div className="container h-full">
        <div className="flex flex-col h-full">
          {posts.map((post) => (
            <p key={post.id}>{post.title}</p>
          ))}
          {!posts.length && <span className="text-center">No posts yet..</span>}
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
        <p className="text-sm font-light text-gray-300 row-span-1 col-span-1 text-ellipsis ">
          {forum.description || "nothing to see here... :)"}
        </p>
      </div>
    </div>
  );
}
