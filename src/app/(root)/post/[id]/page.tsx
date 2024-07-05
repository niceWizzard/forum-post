import { getPostById } from "@/server/db/queries/post";

interface Props {
  params: { id: string };
}

export default async function PostPage({ params: { id } }: Props) {
  const res = await getPostById(id);
  if (!res) {
    return "Invalid post";
  }

  return (
    <section>
      <div className="container">
        <pre>{JSON.stringify(res, null, 4)}</pre>
      </div>
    </section>
  );
}
