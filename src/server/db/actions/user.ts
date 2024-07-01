"use server";
import { validateRequest } from "@/server/auth/action";
import "server-only";
import { db } from "../index";
import { userTable } from "../schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

interface Fields {
  username: string;
  name: string;
}

export async function saveRequiredUserFields({ name, username }: Fields) {
  const { user } = await validateRequest();
  if (!user) {
    return {
      status: 403,
      error: true,
      unathorized: true,
      message: "Please sign in",
    };
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
      return {
        status: 403,
        error: true,
        message: "Username already exists.",
      };
    }
  }

  redirect("/feed");
}

export async function checkUsernameAvailability(username: string) {
  if (!username.trim()) {
    return {
      error: true,
      message: "bad username",
    };
  }
  const { user } = await validateRequest();
  if (!user) {
    return {
      error: true,
      message: "Please login",
    };
  }

  const res = await db.query.userTable.findFirst({
    where: eq(userTable.username, username),
  });

  return {
    error: false,
    data: res == null,
  };
}
