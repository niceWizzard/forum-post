import PostCreateForm from "./_components/postCreateForm";

interface Props {
  params: { forumId: string };
}
export default function PostCreatePage({ params: { forumId } }: Props) {
  return (
    <section className="min-h-[70vh]">
      <div className="container">
        <h3>Create a post</h3>
        <PostCreateForm forumId={forumId} />
      </div>
    </section>
  );
}
