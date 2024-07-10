import "server-only";
import { cache } from "react";
import { getCreatedForums } from "@/server/db/queries/forum";
import { db } from "../index";
import { eq } from "drizzle-orm";
import { userTable } from "../schema";
import { ApiRes, ApiResponse } from "@/server/apiResponse";
import { exposeUserType, Forum, User } from "../schema/types";
import { ApiError } from "@/server/apiErrors";

export const getUser = cache(
  async (userId: string): Promise<ApiResponse<User>> => {
    const dbRes = await db.query.userTable.findFirst({
      where: eq(userTable.id, userId),
    });

    if (!dbRes) {
      return ApiRes.error({
        message: "User not found",
        code: ApiError.UserNotFound,
      });
    }

    return ApiRes.success({
      data: exposeUserType(dbRes),
    });
  }
);

export const getUserProfile = cache(
  async (
    userId: string
  ): Promise<ApiResponse<{ user: User; createdForums: Forum[] }>> => {
    const createdForumsRes = await getCreatedForums(userId);
    if (createdForumsRes.error) {
      return createdForumsRes;
    }
    const createdForums = createdForumsRes.data;
    const userRes = await getUser(userId);
    if (userRes.error) {
      return userRes;
    }

    const user = userRes.data;

    return ApiRes.success({
      data: {
        createdForums,
        user,
      },
    });
  }
);

export const getUserByUsername = cache(
  async (username: string): Promise<ApiResponse<User | null>> => {
    try {
      const user = await db.query.userTable.findFirst({
        where: eq(userTable.username, username),
      });
      return ApiRes.success({ data: user ? exposeUserType(user) : null });
    } catch (_e: any) {
      const e = _e as Error;
      return ApiRes.error({ message: e.message, code: ApiError.UnknownError });
    }
  }
);
