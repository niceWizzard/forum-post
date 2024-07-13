import "server-only";
import { db } from "../index";
import { postLikeTable, postTable } from "../schema/post";
import { and, asc, count, eq, desc, countDistinct, sql } from "drizzle-orm";
import { userTable } from "../schema";
import {
  exposeUserType,
  minimizeData,
  PostWithComments,
  SortOrder,
  SortType,
} from "../schema/types";
import { cache } from "react";
import { forumTable } from "../schema/forum";
import { getAuth } from "@/server/auth";
import { ApiRes, ApiResponse } from "@/server/apiResponse";
import { ApiError } from "@/server/apiErrors";
import { commentLikeTable, commentTable } from "../schema/comment";
import { isTuple } from "@/lib/utils.server";

export const getPostById = cache(
  async ({
    id,
    commentPageNumber,
    sort,
    sortOrder,
  }: {
    id: string;
    commentPageNumber: number;
    sort: SortType;
    sortOrder: SortOrder;
  }): Promise<ApiResponse<PostWithComments>> => {
    const { user } = await getAuth();
    const orderFunc = sortOrder == "down" ? desc : asc;
    try {
      const [res, rawComments] = await db.batch([
        db
          .select({
            user: { ...userTable },
            forum: { ...forumTable },
            post: { ...postTable },
            likeCount: countDistinct(postLikeTable),
            commentCount: count(commentTable.postId),
          })
          .from(postTable)
          .where(eq(postTable.id, id))
          .leftJoin(userTable, eq(userTable.id, postTable.posterId))
          .leftJoin(forumTable, eq(forumTable.id, postTable.forumId))
          .leftJoin(postLikeTable, eq(postLikeTable.postId, postTable.id))
          .leftJoin(commentTable, eq(commentTable.postId, postTable.id))
          .groupBy(userTable.id, forumTable.id, postTable.id),
        db
          .select({
            user: { ...userTable },
            comment: { ...commentTable },
            likeCount: sql<number>`COUNT(DISTINCT ${commentLikeTable.userId}) AS like_count`,
            isLiked: sql<boolean>`SUM( CASE
            WHEN ${commentLikeTable.userId} = ${
              user?.id ?? "11111111-1111-1111-1111-1ce992f5e2db"
            } THEN 1 ELSE 0 END) > 0`,
          })
          .from(commentTable)
          .where(eq(commentTable.postId, id))
          .orderBy(
            sort == "newest"
              ? orderFunc(commentTable.createdAt)
              : orderFunc(sql`like_count`),
            asc(commentTable.createdAt)
          )
          .limit(10)
          .offset((commentPageNumber - 1) * 10)
          .leftJoin(userTable, eq(userTable.id, commentTable.commenterId))
          .leftJoin(
            commentLikeTable,
            eq(commentLikeTable.commentId, commentTable.id)
          )
          .groupBy(commentTable.commenterId, userTable.id, commentTable.id),
      ]);

      if (res.length == 0)
        return ApiRes.error({
          message: "No such post found",
          code: ApiError.PostNotFound,
        });

      const { likeCount, commentCount, ...data } = res[0];
      const poster = data.user ? exposeUserType(data.user) : null;
      const forum = minimizeData(data.forum!);

      let isLiked: boolean | null = null;

      if (user) {
        const likeRes = await db.query.postLikeTable.findFirst({
          where: and(
            eq(postLikeTable.postId, data.post.id),
            eq(postLikeTable.userId, user.id)
          ),
        });
        isLiked = likeRes ? true : false;
      }

      return ApiRes.success({
        data: {
          poster,
          forum,
          isLiked,
          initialComments: rawComments.map(
            ({ user, comment, likeCount, ...v }) => {
              let isLiked = user ? v.isLiked : null;
              return {
                commenter: user,
                likeCount,
                isLiked,
                ...comment,
              };
            }
          ),
          likeCount,
          commentCount,
          ...data.post,
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
);
