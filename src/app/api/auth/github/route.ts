import { AuthFlowType, isAuthType } from "@/lib/utils.server";
import { ApiError } from "@/server/apiErrors";
import { ApiRes } from "@/server/apiResponse";
import { github } from "@/server/auth/providers";
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
  cookies().set("github_oauth_state", state, options);

  cookies().set("oauth_flow_type", type, options);

  return Response.redirect(url);
}
