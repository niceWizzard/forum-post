import { AuthFlowType, isAuthType } from "@/lib/utils.server";
import { ApiError } from "@/server/apiErrors";
import { ApiRes, NextApiRes } from "@/server/apiResponse";
import { github } from "@/server/auth/providers";
import { CookieName } from "@/server/cookieName";
import { generateState } from "arctic";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<Response> {
  const reqUrl = new URL(request.url);
  const type: AuthFlowType | string | null = reqUrl.searchParams.get("type");

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

  try {
    const state = generateState();
    const url = await github.createAuthorizationURL(state, {
      scopes: ["user:email"],
    });

    const options = {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 10,
      sameSite: "lax",
    } as const;
    cookies().set(CookieName.GITHUB_OAUTH_STATE, state, options);

    cookies().set(CookieName.OAUTH_FLOW_TYPE, type, options);

    return Response.redirect(url);
  } catch (e) {
    const err = e as Error;
    return NextApiRes.error({
      message: err.message,
      code: ApiError.UnknownError,
    });
  }
}
