"use server";
import { ApiError } from "@/server/apiErrors";
import { ApiRes, ApiResponse } from "@/server/apiResponse";
import { getAuth } from "@/server/auth";
import "server-only";
import { db } from "..";
import { commentTable } from "../schema/comment";
import { postTable } from "../schema/post";
import { eq } from "drizzle-orm";
import { type RawComment } from "../schema/types";
import { revalidatePath } from "next/cache";

export const createComment = async ({
  commentBody,
  postId,
}: {
  commentBody: string;
  postId: string;
}): Promise<ApiResponse<RawComment>> => {
  try {
    const { user } = await getAuth();
    if (!user) {
      return ApiRes.error({
        message: "Please login",
        code: ApiError.AuthRequired,
      });
    }
    if (!commentBody || !commentBody.trim()) {
      return ApiRes.error({
        message: "Comment body cannot be empty",
        code: ApiError.InvalidParameter,
      });
    }

    const post = await db.query.postTable.findFirst({
      where: eq(postTable.id, postId),
    });

    if (!post) {
      return ApiRes.error({
        message: "Post not found",
        code: ApiError.PostNotFound,
      });
    }

    const comment = await db
      .insert(commentTable)
      .values({
        body: commentBody,
        commenterId: user.id,
        postId,
      })
      .returning();

    if (comment.length == 0) {
      return ApiRes.error({
        message: "Failed to create comment",
        code: ApiError.UnknownError,
      });
    }

    revalidatePath(`/post/${postId}`);

    return ApiRes.success({
      data: comment[0],
    });
  } catch (e: any) {
    const err = e as Error;

    return ApiRes.error({
      message: err.message,
      code: ApiError.UnknownError,
    });
  }
};
