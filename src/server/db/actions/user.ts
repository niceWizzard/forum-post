"use server";
import "server-only";
import { db } from "../index";
import { userTable } from "../schema";
import { eq } from "drizzle-orm";
import { getAuth } from "@/server/auth";
import { ApiRes, ApiResponse } from "@/server/apiResponse";
import { User } from "lucia";
import { ApiError } from "@/server/apiErrors";

interface Fields {
  username: string;
  name: string;
}

export async function saveRequiredUserFields({
  name,
  username,
}: Fields): Promise<ApiResponse<User>> {
  try {
    const { user } = await getAuth();
    if (!user) {
      return ApiRes.error({
        message: "Please sign in",
        code: ApiError.AuthRequired,
      });
    }

    await db
      .update(userTable)
      .set({
        name,
        username,
      })
      .where(eq(userTable.id, user.id));
  } catch (e: any) {
    if (e.code && e.code == "23505") {
      return ApiRes.error({
        message: "Username already exists.",
        code: ApiError.UsernameAlreadyExists,
      });
    }
  }

  return ApiRes.success({
    data: (await getAuth()).user!,
  });
}
