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
  async (): Promise<ApiResponse<Notification[]>> => {
    const { user } = await getAuth();
    try {
      if (!user) {
        return ApiRes.error({
          message: "User not authenticated",
          code: ApiError.AuthRequired,
        });
      }
      const notifications = await db
        .select()
        .from(notificationTable)
        .where(eq(notificationTable.userId, user.id))
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
