import "server-only";
import { redirect } from "next/navigation";
import { validateRequest } from "./action";

type Auth = Awaited<ReturnType<typeof validateRequest>>;

interface Options {
  auth?: Auth;
  redirectUrl?: string;
}

interface AuthenticatedOnlyOptions extends Options {
  onboardCheck: boolean;
}

export async function authenticatedOnly(
  { auth, redirectUrl, onboardCheck }: AuthenticatedOnlyOptions = {
    onboardCheck: true,
  }
) {
  if (!auth) {
    auth = await validateRequest();
  }

  if (auth.user == null) {
    return redirect(redirectUrl ?? "/login");
  }

  if (onboardCheck && (auth.user.name == null || auth.user.username == null)) {
    return redirect("/onboarding");
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
