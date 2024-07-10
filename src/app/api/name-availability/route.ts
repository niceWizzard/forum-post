import { ApiError } from "@/server/apiErrors";
import { ApiRes, NextApiRes } from "@/server/apiResponse";
import { db } from "@/server/db";
import { userTable } from "@/server/db/schema";
import { forumTable } from "@/server/db/schema/forum";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest): Promise<NextResponse> => {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const name = searchParams.get("name");
  if (name == null || name.length < 3) {
    return NextResponse.json(
      ApiRes.error({
        message: "Name is missing or invalid.",
        code: ApiError.MissingParameter,
      }),
      {
        status: 300,
      }
    );
  }
  try {
    switch (type) {
      case "forum":
        return await handleForumCheck(name);
      case "username":
        return await handleUsernameCheck(name);
    }
  } catch (e) {
    const err = e as Error;
    return NextApiRes.error({
      message: err.message,
      code: ApiError.UnknownError,
    });
  }

  return NextResponse.json(
    ApiRes.error({
      message: "Invalid type",
      code: ApiError.InvalidParameter,
    }),
    {
      status: 300,
    }
  );
};

async function handleForumCheck(name: string) {
  const res = await db.query.forumTable.findFirst({
    where: eq(forumTable.name, name),
  });

  return NextResponse.json(
    ApiRes.success({
      data: res == null,
    })
  );
}

async function handleUsernameCheck(name: string) {
  const res = await db.query.userTable.findFirst({
    where: eq(userTable.username, name),
  });

  return NextResponse.json(
    ApiRes.success({
      data: res == null,
    })
  );
}
