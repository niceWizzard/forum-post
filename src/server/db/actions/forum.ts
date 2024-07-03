"use server";

import { getAuth } from "@/server/auth";
import { db } from "../index";
import { forumTable } from "../schema";
import { eq } from "drizzle-orm";

export async function checkForumNameAvailability(forumName: string) {
  if (!forumName.trim()) {
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

  const res = await db.query.forumTable.findFirst({
    where: eq(forumTable.name, forumName),
  });

  return {
    error: false,
    data: res == null,
  };
}

export async function createForum({
  forumDesc,
  forumName,
  userId,
}: {
  userId: string;
  forumName: string;
  forumDesc: string;
}): Promise<{ error: boolean; message: string }> {
  const { user } = await getAuth();
  if (!user) {
    return {
      error: true,
      message: "Please login",
    };
  }

  if (user.id !== userId) {
    return {
      error: true,
      message: "Unathorized",
    };
  }

  await db.insert(forumTable).values({
    name: forumName,
    description: forumDesc,
    ownerId: userId,
  });

  return {
    error: false,
    message: "Created succesfully",
  };
}
