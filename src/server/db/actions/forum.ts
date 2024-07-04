"use server";

import { getAuth } from "@/server/auth";
import { db } from "../index";
import { forumTable } from "../schema";
import { eq } from "drizzle-orm";

export async function createForum({
  forumDesc,
  forumName,
  userId,
}: {
  userId: string;
  forumName: string;
  forumDesc: string;
}): Promise<{ error: boolean; message: string, data?: {forumId : string} }> {
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

  const res = await db.insert(forumTable).values({
    name: forumName,
    description: forumDesc,
    ownerId: userId,
  }).returning();

  return {
    error: false,
    message: "Created succesfully",
    data : {
      forumId:  res[0].id
    }
  };
}
