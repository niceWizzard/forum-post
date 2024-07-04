"use server";
import "server-only";
import { z } from "zod";
import { postCreateFormSchema } from "./schema";
import { db } from "../index";
import { getAuth } from "@/server/auth";
import { postTable } from "../schema/post";

export const createForumPost = async ({
  forumId,
  content,
  title,
}: { forumId: string } & z.infer<typeof postCreateFormSchema>) => {
  const { user } = await getAuth();

  if (!user) {
    return {
      error: true,
      message: "Please login",
    };
  }

  const res = await db
    .insert(postTable)
    .values({
      title,
      body: content,
      forumId,
      posterId: user.id,
    })
    .returning();

  return {
    error: false,
    message: "Success",
    data: {
      postId: res[0].id,
    },
  };
};
