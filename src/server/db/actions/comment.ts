"use server";
import { ApiError } from "@/server/apiErrors";
import { ApiRes, ApiResponse } from "@/server/apiResponse";
import { getAuth } from "@/server/auth";
import "server-only";
import { db } from "..";
import { commentLikeTable, commentTable } from "../schema/comment";
import { postTable } from "../schema/post";
import { and, eq, sql } from "drizzle-orm";
import { type RawComment } from "../schema/types";
import { revalidatePath } from "next/cache";
import { getRawComment, fetchComment } from "../queries/comment";

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

export const deleteComment = async (
  commentId: string
): Promise<ApiResponse<boolean>> => {
  try {
    const { user } = await getAuth();
    if (!user) {
      return ApiRes.error({
        message: "Please login",
        code: ApiError.AuthRequired,
      });
    }

    const commentRes = await getRawComment(commentId);

    if (commentRes.error) {
      return commentRes;
    }

    const comment = commentRes.data;

    if (comment.commenterId !== user.id) {
      return ApiRes.error({
        message: "You are not the owner of this comment",
        code: ApiError.Unathorized,
      });
    }

    await db.delete(commentTable).where(eq(commentTable.id, commentId));
    revalidatePath(`/post/${comment.postId}`);

    return ApiRes.success({ data: true });
  } catch (e) {
    const err = e as Error;
    return ApiRes.error({
      message: err.message,
      code: ApiError.UnknownError,
    });
  }
};

export const toggleLikeComment = async (
  commentId: string
): Promise<ApiResponse<boolean>> => {
  try {
    const { user } = await getAuth();
    if (!user) {
      return ApiRes.error({
        message: "Please login",
        code: ApiError.AuthRequired,
      });
    }

    const commentRes = await getRawComment(commentId);
    if (commentRes.error) {
      return commentRes;
    }

    const comment = commentRes.data;

    const likeExists = await db.query.commentLikeTable.findFirst({
      where: and(
        eq(commentLikeTable.commentId, comment.id),
        eq(commentLikeTable.userId, user.id)
      ),
    });

    if (!likeExists) {
      await db.insert(commentLikeTable).values({
        userId: user.id,
        commentId,
      });
    } else {
      await db
        .delete(commentLikeTable)
        .where(
          and(
            eq(commentLikeTable.commentId, comment.id),
            eq(commentLikeTable.userId, user.id)
          )
        );
    }

    return ApiRes.success({
      data: !likeExists,
    });
  } catch (e) {
    const err = e as Error;
    return ApiRes.error({
      message: err.message,
      code: ApiError.UnknownError,
    });
  }
};

export const replyToComment = async (
  commentId: string,
  body: string
): Promise<ApiResponse<boolean>> => {
  try {
    const { user } = await getAuth();
    if (!user) {
      return ApiRes.error({
        message: "Please login",
        code: ApiError.AuthRequired,
      });
    }
    const res = await getRawComment(commentId);
    if (res.error) {
      return res;
    }
    const comment = res.data;
    const replyToId = comment.replyToId;

    await db.insert(commentTable).values({
      body,
      commenterId: user.id,
      postId: comment.postId,
      replyToId: replyToId ?? commentId,
    });

    return ApiRes.success({
      data: true,
    });
  } catch (e) {
    const err = e as Error;
    return ApiRes.error({
      message: err.message,
      code: ApiError.UnknownError,
    });
  }
};
