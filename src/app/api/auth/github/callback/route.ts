import { lucia } from "@/server/auth";
import { cookies } from "next/headers";
import { OAuth2RequestError } from "arctic";
import { github } from "@/server/auth/providers";
import { db } from "@/server/db";
import { userTable } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { NextApiRes, NextApiResponse } from "@/server/apiResponse";
import { ApiError } from "@/server/apiErrors";
import { AuthFlowType, isAuthType } from "@/lib/utils.server";
import { CookieName } from "@/server/cookieName";

async function setSessionCookie(id: string) {
  const session = await lucia.createSession(id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
}

export async function GET(request: Request): Promise<NextApiResponse> {
  const url = new URL(request.url);

  const type: AuthFlowType | string | null =
    cookies().get(CookieName.OAUTH_FLOW_TYPE)?.value ?? null;

  if (!isAuthType(type)) {
    return NextApiRes.error({
      message: "Missing / invalid parameter 'type'",
      code: ApiError.InvalidParameter,
      status: 400,
    });
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState =
    cookies().get(CookieName.GITHUB_OAUTH_STATE)?.value ?? null;
  if (!code || !state || !storedState || state !== storedState) {
    return NextApiRes.error({
      message: "Invalid/missing parameters",
      code: ApiError.InvalidParameter,
    });
  }

  const tokens = await github.validateAuthorizationCode(code);
  const githubUserResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
    },
  });
  const githubUser: GitHubUser = await githubUserResponse.json();

  const existingUser = await db.query.userTable.findFirst({
    where: eq(userTable.github_id, githubUser.id),
  });

  const existingUserWithEmail = await db.query.userTable.findFirst({
    where: eq(userTable.email, githubUser.email),
  });

  try {
    switch (type) {
      case "register":
        if (existingUser) {
          return NextApiRes.error({
            message: "User with the github account already exists",
            code: ApiError.UserAlreadyExists,
            status: 302,
            headers: {
              Location: `/register?error=${ApiError.UserAlreadyExists}`,
            },
          });
        }

        const githubEmails: GithubEmail[] = await (
          await fetch("https://api.github.com/user/emails", {
            headers: {
              Authorization: `Bearer ${tokens.accessToken}`,
            },
          })
        ).json();

        const githubPrimaryEmail = githubEmails.find((v) => v.primary)!;

        const generatedUser = (
          await db
            .insert(userTable)
            .values({
              github_id: githubUser.id,
              email: githubPrimaryEmail.email,
            })
            .returning()
        )[0];

        await setSessionCookie(generatedUser.id);
        return NextApiRes.success({
          data: true,
          message: "User account created.",
          status: 302,
          headers: {
            Location: "/",
          },
        });
      case "login":
        if (!existingUser) {
          if (existingUserWithEmail) {
            return NextApiRes.error({
              message: "User with the github account does not exist",
              code: ApiError.ProviderNotConnected,
              status: 302,
              headers: {
                Location: `/login?error=${ApiError.ProviderNotConnected}`,
              },
            });
          }
          return NextApiRes.error({
            message: "User account does not exists.",
            code: ApiError.UserDoesNotExist,
            status: 302,
            headers: {
              Location: `/login?error=${ApiError.UserDoesNotExist}`,
            },
          });
        }

        await setSessionCookie(existingUser.id);
        return NextApiRes.success({
          data: true,
          message: "User loginned.",
          status: 302,
          headers: {
            Location: "/",
          },
        });
    }
  } catch (_e) {
    const e = _e as Error;
    console.error(e.message);
    if (e instanceof OAuth2RequestError) {
      // invalid code
      return NextApiRes.error({
        message: e.message,
        code: ApiError.InvalidToken,
        status: 302,
        headers: {
          Location: `/${type}?error=${ApiError.InvalidToken}`,
        },
      });
    }
    return NextApiRes.error({
      message: e.message,
      code: ApiError.UnknownError,
      status: 302,
      headers: {
        Location: `/${type}?error=${ApiError.UnknownError}`,
      },
    });
  }
}

interface GitHubUser {
  id: string;
  login: string;
  email: string;
}

interface GithubEmail {
  email: string;
  primary: boolean;
}
