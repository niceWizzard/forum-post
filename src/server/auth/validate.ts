import { redirect } from "next/navigation";
import { validateRequest } from "./action";

type Auth = Awaited<ReturnType<typeof validateRequest>>;

interface Options {
  auth?: Auth;
  redirectUrl?: string;
}

export async function authenticatedOnly({ auth, redirectUrl }: Options = {}) {
  if (!auth) {
    auth = await validateRequest();
  }

  if (auth.user == null) {
    return redirect(redirectUrl ?? "/login");
  }

  return auth;
}

export async function unathenticatedOnly({
  auth,
  redirectUrl,
}: Options = {}): Promise<undefined> {
  if (!auth) {
    auth = await validateRequest();
  }

  if (auth.user != null) {
    return redirect(redirectUrl ?? "/feed");
  }
}
