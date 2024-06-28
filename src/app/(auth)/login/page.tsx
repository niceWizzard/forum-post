import React from "react";

export default function LoginPage() {
  return (
    <section className="w-full h-full flex justify-center px-4 py-2">
      <div className=" w-96 h-96 border border-gray-400 text-center gap-3 px-2 py-4 rounded-md flex flex-col">
        <h3 className="font-semibold text-xl border-b pb-4 border-gray-400">
          Log in or Create your account
        </h3>
        <p className="flex-grow">
          You can continue with your account with the following social media
          providers
        </p>
        <div className="flex flex-col items-stretch justify-center gap-4">
          <button className="bg-primary-800 px-4 py-2 rounded-md ">
            Continue with Google
          </button>
          <button className="bg-primary-800 px-4 py-2 rounded-md ">
            Continue with Github
          </button>
        </div>
        <p className="text-xs font-light text-gray-100 flex-grow content-end">
          Tip: To create an account, you need to continue with one of the social
          media providers
        </p>
      </div>
    </section>
  );
}
