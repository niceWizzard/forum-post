import { ApiRes, ApiResponse } from "@/server/apiResponse";
import { cache } from "react";
import "server-only";
import { Notification } from "../schema/types";
import { ApiError } from "@/server/apiErrors";
import { getAuth } from "@/server/auth";
import { db } from "..";
import { desc, eq } from "drizzle-orm";
import { notificationTable } from "../schema/notification";

export const getNotifications = cache(
  async (userId: string): Promise<ApiResponse<Notification[]>> => {
    try {
      const notifications = await db
        .select()
        .from(notificationTable)
        .where(eq(notificationTable.userId, userId))
        .orderBy(desc(notificationTable.createdAt));
      return ApiRes.success({
        data: notifications,
      });
    } catch (e) {
      const err = e as Error;
      return ApiRes.error({
        message: err.message,
        code: ApiError.UnknownError,
      });
    }
  }
);
