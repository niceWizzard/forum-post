"use server";
import { getAuth } from "@/server/auth";
import { db } from "../index";
import { forumMemberTable, forumTable } from "../schema/forum";
import { ApiRes, ApiResponse } from "@/server/apiResponse";
import { ApiError } from "@/server/apiErrors";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createForum({
  forumDesc,
  forumName,
  userId,
}: {
  userId: string;
  forumName: string;
  forumDesc: string;
}): Promise<ApiResponse<{ forumId: string }>> {
  try {
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
  } catch (e) {
    const err = e as Error;
    return ApiRes.error({
      message: err.message,
      code: ApiError.UnknownError,
    });
  }
}

export async function joinForum(
  forumId: string
): Promise<ApiResponse<boolean>> {
  try {
    const { user } = await getAuth();
    if (!user) {
      return ApiRes.error({
        message: "Please login",
        code: ApiError.AuthRequired,
      });
    }

    const forum = await db.query.forumTable.findFirst({
      where: eq(forumTable.id, forumId),
    });

    if (!forum)
      return ApiRes.error({
        message: "Forum not found",
        code: ApiError.ForumNotFound,
      });

    await db
      .insert(forumMemberTable)
      .values({
        forumId,
        userId: user.id,
      })
      .onConflictDoNothing();

    revalidatePath(`/forum/${forumId}`);

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
}

export async function leaveForum(
  forumId: string
): Promise<ApiResponse<boolean>> {
  try {
    const { user } = await getAuth();
    if (!user) {
      return ApiRes.error({
        message: "Please login",
        code: ApiError.AuthRequired,
      });
    }

    const forum = await db.query.forumTable.findFirst({
      where: eq(forumTable.id, forumId),
    });

    if (!forum)
      return ApiRes.error({
        message: "Forum not found",
        code: ApiError.ForumNotFound,
      });

    const res = await db
      .delete(forumMemberTable)
      .where(
        and(
          eq(forumMemberTable.forumId, forumId),
          eq(forumMemberTable.userId, user.id)
        )
      )
      .returning();

    revalidatePath(`/forum/${forumId}`);
    return ApiRes.success({
      data: res.length == 1,
    });
  } catch (e) {
    const err = e as Error;
    return ApiRes.error({
      message: err.message,
      code: ApiError.UnknownError,
    });
  }
}

export async function deleteForum(
  forumId: string
): Promise<ApiResponse<boolean>> {
  try {
    const { user } = await getAuth();
    if (!user)
      return ApiRes.error({
        message: "Please login",
        code: ApiError.AuthRequired,
      });

    const forum = await db.query.forumTable.findFirst({
      where: eq(forumTable.id, forumId),
    });

    if (!forum)
      return ApiRes.error({
        message: "Forum not found",
        code: ApiError.ForumNotFound,
      });

    if (forum.ownerId !== user.id) {
      return ApiRes.error({
        message: "Unauthorized",
        code: ApiError.Unathorized,
      });
    }

    const res = await db
      .delete(forumTable)
      .where(eq(forumTable.id, forumId))
      .returning();
    if (res.length == 0) {
      return ApiRes.error({
        message: "Forum not found",
        code: ApiError.ForumNotFound,
      });
    }

    revalidatePath(`/forum/${forumId}`);
    revalidatePath(`/feed`);

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
}
