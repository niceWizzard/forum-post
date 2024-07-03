"use server";

import { getAuth } from "@/server/auth";
import { db } from "../index";
import { userTable } from "../schema";
import { eq } from "drizzle-orm";

export async function checkForumNameAvailability(username: string) {
  if (!username.trim()) {
    return {
      error: true,
      message: "bad username",
    };
  }
  const { user } = await getAuth();
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
