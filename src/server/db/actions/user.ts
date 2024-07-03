"use server";
import "server-only";
import { db } from "../index";
import { userTable } from "../schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getAuth } from "@/server/auth";

interface Fields {
  username: string;
  name: string;
}

export async function saveRequiredUserFields({ name, username }: Fields) {
  const { user } = await getAuth();
  if (!user) {
    return {
      status: 403,
      error: true,
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

  return {
    error: false,
    status: 200,
    user: (await getAuth()).user,
  };
}
