import { getForumById } from "@/server/db/queries/forum";

interface Props {
  params: { id: string };
}

const ForumWithIdPage = async ({ params: { id } }: Props) => {
  const forum = await getForumById(id);
  if (!forum) {
    return "Invalid forum";
  }
  return (
    <div>
      <h3>{forum.name}</h3>
      <span>Created at {new Date(forum.createdAt).toLocaleString()}</span>
    </div>
  );
};

export default ForumWithIdPage;
