import { lucia } from "@/server/auth";
import { cookies } from "next/headers";
import { OAuth2RequestError } from "arctic";
import { google } from "@/server/auth/providers";
import { db } from "@/server/db";
import { userTable } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { NextApiRes, NextApiResponse } from "@/server/apiResponse";
import { ApiError } from "@/server/apiErrors";
import { AuthFlowType, isAuthType } from "@/lib/utils.server";
import { CookieName } from "@/server/cookieName";
import { NeonDbError } from "@neondatabase/serverless";

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
    cookies().get(CookieName.GOOGLE_OAUTH_STATE)?.value ?? null;
  const storedVerifier =
    cookies().get(CookieName.GOOGLE_CODE_VERIFIER)?.value ?? null;
  if (
    !code ||
    !state ||
    !storedState ||
    !storedVerifier ||
    state !== storedState
  ) {
    return NextApiRes.error({
      message: `Invalid/missing parameters`,
      code: ApiError.InvalidParameter,
    });
  }

  try {
    const tokens = await google.validateAuthorizationCode(code, storedVerifier);
    const googleUserResponse = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      }
    );
    const googleUser: GoogleUser = await googleUserResponse.json();

    const existingUserWithEmail = await db.query.userTable.findFirst({
      where: eq(userTable.email, googleUser.email),
    });

    const existingUser = await db.query.userTable.findFirst({
      where: eq(userTable.google_id, googleUser.sub),
    });

    switch (type) {
      case "register":
        if (existingUser) {
          return NextApiRes.error({
            message: "User with the google account already exists",
            code: ApiError.UserAlreadyExists,
            status: 302,
            headers: {
              Location: `/register?error=${ApiError.UserAlreadyExists}`,
            },
          });
        }

        const generatedUser = (
          await db
            .insert(userTable)
            .values({
              google_id: googleUser.sub,
              email: googleUser.email,
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
          if (existingUserWithEmail)
            return NextApiRes.error({
              message: "User with the google account does not exist",
              code: ApiError.ProviderNotConnected,
              status: 302,
              headers: {
                Location: `/login?error=${ApiError.ProviderNotConnected}`,
              },
            });

          return NextApiRes.error({
            message: "User account does not exist",
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
    console.error(e);
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
    } else if (e instanceof NeonDbError && e.code == "23505") {
      return NextApiRes.error({
        message: "User with email already exists",
        code: ApiError.UserAlreadyExists,
        status: 302,
        headers: {
          Location: `/${type}?error=${ApiError.UserAlreadyExists}`,
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

interface GoogleUser {
  sub: string;
  email: string;
}
