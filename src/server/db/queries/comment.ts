import { ApiRes, ApiResponse } from "@/server/apiResponse";
import { RawComment } from "../schema/types";
import { cache } from "react";
import { ApiError } from "@/server/apiErrors";
import { db } from "../index";
import { eq } from "drizzle-orm";
import { commentTable } from "../schema/comment";

export const getRawComment = cache(
  async (commentId: string): Promise<ApiResponse<RawComment>> => {
    try {
      const comment = await db.query.commentTable.findFirst({
        where: eq(commentTable.id, commentId),
      });
      if (!comment) {
        return ApiRes.error({
          message: "Comment not found",
          code: ApiError.CommentNotFound,
        });
      }
      return ApiRes.success({
        data: comment,
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
