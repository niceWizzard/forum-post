"use server";
import { validateRequest } from "@/server/auth/action";
import "server-only";
import { db } from "../index";
import { userTable } from "../schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { PostgresError } from "postgres";

interface Fields {
  username: string;
  name: string;
}

export async function saveRequiredUserFields({ name, username }: Fields) {
  const { user } = await validateRequest();
  if (!user) {
    return Response.json({
      status: 403,
      unathorized: true,
      message: "Please sign in",
    });
  }

  try {
    await db
      .update(userTable)
      .set({
        name,
        username,
      })
      .where(eq(userTable.id, user.id));
  } catch (e: any) {
    if (e.code && e.code == "23505") {
      return Response.json({
        status: 403,
        message: "Username already exists.",
      });
    }
  }

  redirect("/feed");
}
