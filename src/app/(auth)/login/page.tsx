import { auth, signIn } from "@/auth";
import Link from "next/link";

export default async function LoginPage() {
  const user = await auth();
  return (
    <section className="w-full h-full flex justify-center px-4 py-12 flex-col items-center gap-4">
      <div className="bg-card text-card-foreground w-96 text-justify h-full   gap-3 px-6 py-4 rounded-md flex flex-col">
        <h2 className="text-xl font-semibold pb-4 border-b text-center">
          Login to your account
        </h2>
        <p className="text-sm font-light">
          To continue with services offered in our website, you need to login
          with your account first.
        </p>
        <pre>{JSON.stringify(user, null, 2)}</pre>

        <p className="mt-4 font-light">
          You can choose to login with the following:
        </p>
        <div className="flex flex-col gap-4 flex-grow justify-center">
          <button className="px-3 py-3 text-lg font-medium rounded-md w-full bg-gray-300 text-gray-900">
            Login with Google
          </button>
          <form
            action={async () => {
              "use server";
              await signIn("github");
            }}
          >
            <button className="px-3 py-3 text-lg font-medium border rounded-md w-full">
              Login with Github
            </button>
          </form>
        </div>
      </div>
      <div className="flex">
        <Link className="underlined" href="/">
          Home
        </Link>
      </div>
    </section>
  );
}
