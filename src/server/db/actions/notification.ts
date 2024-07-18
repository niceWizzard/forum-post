"use server";
import { ApiError } from "@/server/apiErrors";
import { ApiRes, ApiResponse } from "@/server/apiResponse";
import { getAuth } from "@/server/auth";
import "server-only";
import { db } from "..";
import { notificationTable } from "../schema/notification";
import { sql, lt, and, isNull } from "drizzle-orm";
import { makePgArray } from "drizzle-orm/pg-core";

export async function setNotifictionAsRead(): Promise<ApiResponse<boolean>> {
  const { user } = await getAuth();
  try {
    if (!user) {
      return ApiRes.error({
        message: "Please login",
        code: ApiError.AuthRequired,
      });
    }
    const n = await db
      .update(notificationTable)
      .set({
        readAt: new Date(),
      })
      .where(
        and(
          isNull(notificationTable.readAt),
          lt(notificationTable.createdAt, new Date())
        )
      )
      .returning();

    if (n.length == 0) {
      console.log("NO UPDATWED NOTIFICATIONS");
    }
    return ApiRes.success({ data: true });
  } catch (e) {
    const err = e as Error;
    return ApiRes.error({
      message: err.message,
      code: ApiError.UnknownError,
    });
  }
}
