import { db } from "@/server/db";
import { forumTable, userTable } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const name = searchParams.get("name");
  if (name == null || name.length < 3) {
    return Response.json(
      {
        error: true,
        message: "Name is missing or invalid.",
      },
      {
        status: 300,
      }
    );
  }
  switch (type) {
    case "forum":
      return await handleForumCheck(name);
    case "username":
      return await handleUsernameCheck(name);
  }

  return Response.json(
    {
      error: true,
      message: "Invalid type",
    },
    {
      status: 300,
    }
  );
};

async function handleForumCheck(name: string) {
  const res = await db.query.forumTable.findFirst({
    where: eq(forumTable.name, name),
  });

  return Response.json({
    error: false,
    data: res == null,
    message: "Success",
  });
}

async function handleUsernameCheck(name: string) {
  const res = await db.query.userTable.findFirst({
    where: eq(userTable.username, name),
  });

  return Response.json({
    error: false,
    data: res == null,
    message: "Success",
  });
}
