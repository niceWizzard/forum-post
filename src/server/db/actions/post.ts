"use server";
import "server-only";
import { z } from "zod";
import { postCreateFormSchema } from "./schema";
import { createCustomDb, db } from "../index";
import { getAuth } from "@/server/auth";
import { postLikeTable, postTable } from "../schema/post";
import { ApiRes, ApiResponse } from "@/server/apiResponse";
import { ApiError } from "@/server/apiErrors";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const unlikePost = async (postId: string) => {
  try {
    const { user } = await getAuth();
    if (!user) {
      return ApiRes.error({
        message: "Please login",
        code: ApiError.AuthRequired,
      });
    }

    const serverlessDb = await createCustomDb();

    await serverlessDb.transaction(async () => {
      await serverlessDb
        .delete(postLikeTable)
        .where(
          and(
            eq(postLikeTable.postId, postId),
            eq(postLikeTable.userId, user.id)
          )
        );
      await serverlessDb.update(postTable).set({
        likeCount: sql`${postTable.likeCount} - 1`,
      });
    });

    revalidatePath("/forum");
    revalidatePath(`/post/${postId}`);

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
    const serverlessDb = await createCustomDb();

    await serverlessDb.transaction(async () => {
      await serverlessDb
        .insert(postLikeTable)
        .values({
          postId,
          userId: user.id,
        })
        .onConflictDoNothing();
      await serverlessDb.update(postTable).set({
        likeCount: sql`${postTable.likeCount} + 1`,
      });
    });

    revalidatePath("/forum");
    revalidatePath(`/post/${postId}`);

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

    const post = await db.query.postTable.findFirst({
      where: and(eq(postTable.id, postId), eq(postTable.posterId, user.id)),
    });

    if (!post) {
      return ApiRes.error({
        message: "No such post found",
        code: ApiError.PostNotFound,
      });
    }

    if (post.posterId !== user.id) {
      return ApiRes.error({
        message: "Unauthorized to delete the post.",
        code: ApiError.Unathorized,
      });
    }

    await db
      .delete(postTable)
      .where(and(eq(postTable.posterId, user.id), eq(postTable.id, postId)));

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
