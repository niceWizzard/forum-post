"use server";
import "server-only";
import { z } from "zod";
import { postCreateFormSchema } from "./schema";
import { db } from "../index";
import { getAuth } from "@/server/auth";
import { postTable } from "../schema/post";
import { ApiRes, ApiResponse } from "@/server/apiResponse";

export const createForumPost = async ({
  forumId,
  content,
  title,
}: { forumId: string } & z.infer<typeof postCreateFormSchema>): Promise<
  ApiResponse<{ postId: string }>
> => {
  const { user } = await getAuth();

  if (!user) {
    return ApiRes.error({
      message: "Please login",
      code: 1,
    });
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

  return ApiRes.success({
    data: {
      postId: res[0].id,
    },
  });
};
