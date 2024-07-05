"use server";

import { getAuth } from "@/server/auth";
import { db } from "../index";
import { eq } from "drizzle-orm";
import { forumTable } from "../schema/forum";
import { ApiRes, ApiResponse } from "@/server/apiResponse";
import { ApiError } from "@/server/apiErrors";

export async function createForum({
  forumDesc,
  forumName,
  userId,
}: {
  userId: string;
  forumName: string;
  forumDesc: string;
}): Promise<ApiResponse<{ forumId: string }>> {
  const { user } = await getAuth();
  if (!user) {
    return ApiRes.error({
      message: "Please login",
      code: ApiError.AuthRequired,
    });
  }

  if (user.id !== userId) {
    return ApiRes.error({
      message: "Unauthorized",
      code: ApiError.Unathorized,
    });
  }

  const res = await db
    .insert(forumTable)
    .values({
      name: forumName,
      description: forumDesc,
      ownerId: userId,
    })
    .returning();

  return ApiRes.success({
    data: {
      forumId: res[0].id,
    },
  });
}
