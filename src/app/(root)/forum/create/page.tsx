import React from "react";
import ForumCreateForm from "./_components/ForumCreateForm";

const ForumCreatePage = () => {
  return (
    <section className="w-full py-4 min-h-[70vh] flex justify-center items-center ">
      <div className="container mx-auto md:max-w-[60vw]">
        <h3 className="text-xl">Create a Forum</h3>
        <ForumCreateForm />
      </div>
    </section>
  );
};

export default ForumCreatePage;
