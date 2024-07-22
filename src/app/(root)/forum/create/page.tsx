import ForumCreateForm from "./_components/ForumCreateForm";
import { authenticatedOnly } from "@/server/auth/validate";

export const metadata = {
  title: "Forum Post - Create Forum",
  description: "Create a new discussion forum",
};

const ForumCreatePage = async () => {
  const { user } = await authenticatedOnly();
  return (
    <section className="w-full py-4 min-h-[70vh] flex justify-center items-center ">
      <div className="container mx-auto md:max-w-[60vw]">
        <h3 className="text-xl">Create a Forum</h3>
        <ForumCreateForm userId={user.id} />
      </div>
    </section>
  );
};

export default ForumCreatePage;
