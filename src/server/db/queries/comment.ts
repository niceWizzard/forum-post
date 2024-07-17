import { ApiRes, ApiResponse } from "@/server/apiResponse";
import {
  Comment,
  RawComment,
  ReplyComment,
  exposeUserType,
} from "../schema/types";
import { cache } from "react";
import { ApiError } from "@/server/apiErrors";
import { db } from "../index";
import {
  asc,
  countDistinct,
  desc,
  eq,
  isNotNull,
  isNull,
  sql,
} from "drizzle-orm";
import { commentLikeTable, commentTable } from "../schema/comment";
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
      const res = await fetchComment(user?.id ?? null)
        .where(eq(commentTable.replyToId, commentId))
        .orderBy(asc(commentTable.createdAt));

      return ApiRes.success({
        data: res.map((v) => ({
          ...v.comment,
          replyToId: commentId,
          isLiked: user ? v.isLiked : null,
          likeCount: v.likeCount,
          commenter: v.user,
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

export const getCommentById = cache(
  async (commentId: string): Promise<ApiResponse<Comment>> => {
    try {
      const { user } = await getAuth();
      const res = await fetchComment(user?.id ?? null).where(
        eq(commentTable.id, commentId)
      );
      if (res.length == 0) {
        return ApiRes.error({
          message: "Comment not found",
          code: ApiError.CommentNotFound,
        });
      }
      const {
        isLiked,
        likeCount,
        replyCount,
        user: commenter,
        ...data
      } = res[0];
      const comment: Comment = {
        ...data.comment,
        isLiked,
        likeCount,
        replyCount,
        commenter: commenter ? exposeUserType(commenter) : null,
      };
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

export function fetchComment(userId: string | null) {
  return db
    .select({
      user: { ...userTable },
      comment: { ...commentTable },
      likeCount: sql<number>`CAST(COUNT(DISTINCT ${commentLikeTable.userId}) AS INT) AS like_count`,
      isLiked: sql<boolean>`SUM( CASE
    WHEN ${commentLikeTable.userId} = ${
        userId ?? "11111111-1111-1111-1111-1ce992f5e2db"
      } THEN 1 ELSE 0 END) > 0`,
      replyCount: countDistinct(sql`reply`),
    })
    .from(commentTable)
    .leftJoin(userTable, eq(userTable.id, commentTable.commenterId))
    .leftJoin(commentLikeTable, eq(commentLikeTable.commentId, commentTable.id))
    .leftJoin(
      sql`${commentTable} AS reply`,
      sql`reply.reply_to_id = ${commentTable.id}`
    )
    .groupBy(commentTable.commenterId, userTable.id, commentTable.id)
    .$dynamic();
}
