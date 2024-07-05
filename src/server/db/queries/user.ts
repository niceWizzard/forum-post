import "server-only";
import { cache } from "react";
import { getCreatedForums } from "@/server/db/queries/forum";
import { db } from "../index";
import { eq } from "drizzle-orm";
import { userTable } from "../schema";
import { ApiRes, ApiResponse } from "@/server/apiResponse";
import { exposeUserType, Forum, User } from "../schema/types";

export const getUser = cache(
  async (userId: string): Promise<ApiResponse<User>> => {
    const dbRes = await db.query.userTable.findFirst({
      where: eq(userTable.id, userId),
    });

    if (!dbRes) {
      return ApiRes.error({
        message: "User not found",
        code: 1,
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
      return ApiRes.error({
        message: createdForumsRes.message,
        code: 1,
      });
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
