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
import { AuthFlowType, isAuthType } from "@/lib/utils.server";

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

  const type: AuthFlowType | string | null =
    cookies().get("oauth_flow_type")?.value ?? null;

  if (!isAuthType(type)) {
    return NextResponse.json(
      ApiRes.error({
        message: "Missing / invalid parameter 'type'",
        code: ApiError.InvalidParameter,
      }),
      {
        status: 400,
      }
    );
  }

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

  switch (type) {
    case "register":
      try {
        if (existingUser) {
          return NextResponse.json(
            ApiRes.error({
              message: "User with the github account already exists",
              code: ApiError.UnknownError,
            })
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

        await setSessionCookie(generatedUser.id);
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
    case "login":
      if (!existingUser) {
        return NextResponse.json(
          ApiRes.error({
            message: "User with the github account does not exist",
            code: ApiError.UnknownError,
          }),
          {
            status: 400,
          }
        );
      }

      await setSessionCookie(existingUser.id);
      return NextResponse.json(
        ApiRes.success({
          data: true,
          message: "User loginned.",
        }),
        {
          status: 302,
          headers: {
            Location: "/",
          },
        }
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
