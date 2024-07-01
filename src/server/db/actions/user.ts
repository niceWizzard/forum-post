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
    throw new Error("Please sign in");
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
      console.error(`Username: ${username} already exists.`);
    }
  }

  redirect("/feed");
}
