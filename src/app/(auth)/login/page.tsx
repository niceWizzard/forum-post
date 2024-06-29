import Link from "next/link";

export default function LoginPage() {
  return (
    <section className="w-full h-full flex justify-center px-4 py-12 flex-col items-center gap-4">
      <div className="bg-card text-card-foreground w-128 h-full  text-center gap-3 px-6 py-4 rounded-md flex flex-col">
        <h3 className="font-semibold text-xl border-b pb-4 border-gray-400">
          Log in or Create your account
        </h3>
        <p className="flex-grow">
          You can continue with your account with the following social media
          providers
        </p>
        <div className="flex flex-col items-stretch justify-start gap-4 flex-grow ">
          <button className="bg-primary px-4 py-2 rounded-md h-16 text-lg text-start">
            Continue with Google
          </button>
          <button className="bg-primary px-4 py-2 rounded-md h-16 text-lg text-start">
            Continue with Github
          </button>
        </div>
        <p className="text-xs font-light text-gray-300 flex-grow content-end">
          Tip: To create an account, you need to continue with one of the social
          media providers
        </p>
      </div>
      <div className="flex">
        <Link className="underlined" href="/">
          Home
        </Link>
      </div>
    </section>
  );
}
