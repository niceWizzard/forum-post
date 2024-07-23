"use server";
import { getAuth } from "@/server/auth";
import { db } from "../index";
import { forumAdminTable, forumMemberTable, forumTable } from "../schema/forum";
import { ApiRes, ApiResponse } from "@/server/apiResponse";
import { ApiError } from "@/server/apiErrors";
import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { userTable } from "../schema";
import { getForumAdminInvite, getRawForumById } from "../queries/forum";
import { notificationTable } from "../schema/notification";

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

    revalidatePath(`/feed`);

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

export async function assignAdmin(
  forumId: string,
  ids: string[]
): Promise<ApiResponse<boolean>> {
  if (ids.length == 0) {
    return ApiRes.error({
      message: "No users selected to assign as admins.",
      code: ApiError.InvalidParameter,
    });
  }
  try {
    const { user } = await getAuth();
    if (!user) {
      return ApiRes.error({
        message: "Please login",
        code: ApiError.AuthRequired,
      });
    }

    const forum = await getRawForumById(forumId);

    if (forum?.ownerId !== user.id) {
      return ApiRes.error({
        message: "Only creators can assign administrators.",
        code: ApiError.Unathorized,
      });
    }

    const userExists = await db.query.userTable.findMany({
      where: inArray(userTable.id, ids),
    });

    if (userExists.length == 0) {
      return ApiRes.error({
        message: "User assigning to be admin not found.",
        code: ApiError.UserNotFound,
      });
    }

    const res = await db
      .insert(forumAdminTable)
      .values(
        userExists.map((v) => ({
          forumId,
          adminId: v.id,
        }))
      )
      .onConflictDoNothing()
      .returning();
    await db.insert(notificationTable).values(
      userExists.map((v) => {
        return {
          message: `You have been invited to be an admin for <b>${forum.name}</b>`,
          userId: v.id,
          linkTo: `/forum/admin/invite/${forumId}`,
        };
      })
    );

    if (res.length == 0) {
      return ApiRes.error({
        message: "User already assigned as admin.",
        code: ApiError.UserAlreadyExists,
      });
    }

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

export async function deleteAdmin(
  adminId: string,
  forumId: string
): Promise<ApiResponse<boolean>> {
  const { user } = await getAuth();
  if (!user) {
    return ApiRes.error({
      message: "Please login",
      code: ApiError.AuthRequired,
    });
  }
  try {
    const forum = await getRawForumById(forumId);
    if (!forum) {
      return ApiRes.error({
        message: "Forum not found",
        code: ApiError.ForumNotFound,
      });
    }
    if (forum.ownerId !== user.id) {
      return ApiRes.error({
        message: "Only creators can delete administrators.",
        code: ApiError.Unathorized,
      });
    }
    const res = await db
      .delete(forumAdminTable)
      .where(
        and(
          eq(forumAdminTable.forumId, forumId),
          eq(forumAdminTable.adminId, adminId)
        )
      )
      .returning();
    if (res.length == 0) {
      return ApiRes.error({
        message: "Admin not found in forum",
        code: ApiError.UserNotFound,
      });
    }
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

export async function resolveAdminInvite({
  forumId,
  accept,
}: {
  forumId: string;
  accept: boolean;
}): Promise<ApiResponse<boolean>> {
  const { user } = await getAuth();
  if (!user) {
    return ApiRes.error({
      message: "Please login",
      code: ApiError.AuthRequired,
    });
  }
  try {
    const forum = await getRawForumById(forumId);
    if (!forum) {
      return ApiRes.error({
        message: "Forum not found",
        code: ApiError.ForumNotFound,
      });
    }
    const adminInvite = await getForumAdminInvite(forumId);
    if (adminInvite.error) {
      return adminInvite;
    }

    if (adminInvite.data.status !== "pending") {
      return ApiRes.error({
        message: "Admin invite already resolved",
        code: ApiError.InvalidParameter,
      });
    }

    await db
      .update(forumAdminTable)
      .set({
        status: accept ? "accepted" : "rejected",
      })
      .where(
        and(
          eq(forumAdminTable.adminId, user.id),
          eq(forumAdminTable.forumId, forumId)
        )
      );

    return ApiRes.success({ data: true });
  } catch (e) {
    const err = e as Error;
    return ApiRes.error({
      message: err.message,
      code: ApiError.UnknownError,
    });
  }
}
