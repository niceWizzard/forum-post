"use server";
import "server-only";
import { z } from "zod";
import { postCreateFormSchema } from "./schema";
import { getAuth } from "@/server/auth";
import { postLikeTable, postTable } from "../schema/post";
import { ApiRes, ApiResponse } from "@/server/apiResponse";
import { ApiError } from "@/server/apiErrors";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "../";
import { forumTable } from "../schema/forum";
import { fetchPost, getPostByIdWithNoComment } from "../queries/post";

export const unlikePost = async (postId: string) => {
  try {
    const { user } = await getAuth();
    if (!user) {
      return ApiRes.error({
        message: "Please login",
        code: ApiError.AuthRequired,
      });
    }

    await db
      .delete(postLikeTable)
      .where(
        and(eq(postLikeTable.postId, postId), eq(postLikeTable.userId, user.id))
      );

    revalidatePath("/forum");

    return ApiRes.success({
      message: "Post liked successfully",
      data: true,
    });
  } catch (e: any) {
    const err = e as Error;
    return ApiRes.error({
      message: e.message,
      code: ApiError.UnknownError,
    });
  }
};

export const likePost = async (postId: string) => {
  try {
    const { user } = await getAuth();
    if (!user) {
      return ApiRes.error({
        message: "Please login",
        code: ApiError.AuthRequired,
      });
    }

    await db
      .insert(postLikeTable)
      .values({
        postId,
        userId: user.id,
      })
      .onConflictDoNothing();

    revalidatePath("/forum");

    return ApiRes.success({
      message: "Post liked successfully",
      data: true,
    });
  } catch (e: unknown) {
    const err = e as Error;
    return ApiRes.error({
      message: err.message,
      code: ApiError.UnknownError,
    });
  }
};

export const createForumPost = async ({
  forumId,
  content,
  title,
}: { forumId: string } & z.infer<typeof postCreateFormSchema>): Promise<
  ApiResponse<{ postId: string }>
> => {
  try {
    const { user } = await getAuth();

    if (!user) {
      return ApiRes.error({
        message: "Please login",
        code: ApiError.AuthRequired,
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

    revalidatePath(`/forum/${forumId}`);

    return ApiRes.success({
      data: {
        postId: res[0].id,
      },
    });
  } catch (e) {
    const err = e as Error;
    return ApiRes.error({
      message: err.message,
      code: ApiError.UnknownError,
    });
  }
};

export const deletePost = async (postId: string) => {
  try {
    const { user } = await getAuth();
    if (!user) {
      return ApiRes.error({
        message: "Please login",
        code: ApiError.AuthRequired,
      });
    }

    const res = await getPostByIdWithNoComment(postId);

    if (res.error) {
      return res;
    }

    const { forum, ...post } = res.data;

    if (post.posterId !== user.id && !forum.isAdmin && !forum.isOwner) {
      return ApiRes.error({
        message: "Unauthorized to delete the post.",
        code: ApiError.Unathorized,
      });
    }

    await db.delete(postTable).where(eq(postTable.id, postId));

    revalidatePath(`/post/${postId}`);
    revalidatePath(`/forum/${post.forumId}`);

    return ApiRes.success({
      data: true,
    });
  } catch (err: any) {
    const e = err as Error;
    return ApiRes.error({
      message: e.message,
      code: ApiError.UnknownError,
    });
  }
};
