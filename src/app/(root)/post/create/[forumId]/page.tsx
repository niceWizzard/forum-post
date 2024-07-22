import PostCreateForm from "./_components/postCreateForm";

export const metadata = {
  title: "Forum Post - Create Post",
  description: "Create a new post in the forum",
};

interface Props {
  params: { forumId: string };
}
export default function PostCreatePage({ params: { forumId } }: Props) {
  return (
    <section className="min-h-[70vh] py-12">
      <div className="container">
        <h3>Create a post</h3>
        <PostCreateForm forumId={forumId} />
      </div>
    </section>
  );
}
