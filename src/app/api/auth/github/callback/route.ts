import { lucia } from "@/server/auth";
import { cookies } from "next/headers";
import { OAuth2RequestError } from "arctic";
import { generateIdFromEntropySize } from "lucia";
import { github } from "@/server/auth/providers";
import { db } from "@/server/db";
import { userTable } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ApiRes, ApiResponse } from "@/server/apiResponse";
import { ApiError } from "@/server/apiErrors";

async function setSessionCookie(id: string) {
  const session = await lucia.createSession(id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
}

export async function GET(
  request: Request
): Promise<NextResponse<ApiResponse<any>>> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = cookies().get("github_oauth_state")?.value ?? null;
  if (!code || !state || !storedState || state !== storedState) {
    return NextResponse.json(
      ApiRes.error({
        message: "Invalid/missing parameters",
        code: ApiError.InvalidParameter,
      })
    );
  }

  try {
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

    if (existingUser) {
      await setSessionCookie(existingUser.id);
      return NextResponse.json(
        ApiRes.success({
          data: true,
          message: "User already exists",
        }),
        {
          status: 302,
          headers: {
            Location: "/",
          },
        }
      );
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

    setSessionCookie(generatedUser.id);
    return NextResponse.json(
      ApiRes.success({
        data: true,
        message: "User account created.",
      }),
      {
        status: 302,
        headers: {
          Location: "/",
        },
      }
    );
  } catch (_e) {
    const e = _e as Error;
    // the specific error message depends on the provider
    console.error(e.message);
    if (e instanceof OAuth2RequestError) {
      // invalid code
      return NextResponse.json(
        ApiRes.error({
          message: e.message,
          code: ApiError.UnknownError,
        })
      );
    }
    return NextResponse.json(
      ApiRes.error({
        message: e.message,
        code: ApiError.UnknownError,
      })
    );
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
