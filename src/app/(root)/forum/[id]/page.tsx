import { getForumById } from "@/server/db/queries/forum";
import { forumTable } from "@/server/db/schema";
import * as schema from "@/server/db/schema";
import { InferSelectModel } from "drizzle-orm";

interface Props {
  params: { id: string };
}

const ForumWithIdPage = async ({ params: { id } }: Props) => {
  const forum = await getForumById(id);
  if (!forum) {
    return "Invalid forum";
  }

  return (
    <section>
      <ForumHeader forum={forum} />
    </section>
  );
};

export default ForumWithIdPage;
function ForumHeader({
  forum,
}: {
  forum: InferSelectModel<typeof forumTable>;
}) {
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
