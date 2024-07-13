import { ApiRes, ApiResponse } from "@/server/apiResponse";
import { RawComment, ReplyComment } from "../schema/types";
import { cache } from "react";
import { ApiError } from "@/server/apiErrors";
import { db } from "../index";
import { asc, desc, eq } from "drizzle-orm";
import { commentTable } from "../schema/comment";
import { getAuth } from "@/server/auth";
import { userTable } from "../schema";

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

export const getCommentReplies = cache(
  async (commentId: string): Promise<ApiResponse<ReplyComment[]>> => {
    try {
      const { user } = await getAuth();
      const res = await db
        .select({
          comment: { ...commentTable },
          commenter: {
            id: userTable.id,
            username: userTable.username,
            name: userTable.name,
            email: userTable.email,
          },
        })
        .from(commentTable)
        .where(eq(commentTable.id, commentId))
        .leftJoin(userTable, eq(userTable.id, commentTable.commenterId))
        .orderBy(asc(commentTable.createdAt));

      return ApiRes.success({
        data: res.map((v) => ({
          ...v.comment,
          isLiked: null,
          likeCount: 0,
          commenter: v.commenter,
        })),
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
