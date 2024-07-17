import "server-only";
import { db } from "../index";
import { postLikeTable, postTable } from "../schema/post";
import {
  and,
  asc,
  count,
  eq,
  desc,
  countDistinct,
  sql,
  isNull,
} from "drizzle-orm";
import { userTable } from "../schema";
import {
  exposeUserType,
  minimizeData,
  Post,
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
import { fetchComment } from "./comment";
import { createIsAdminSubQuery } from "./forum";

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
        fetchPost(user?.id ?? null).where(eq(postTable.id, id)),
        fetchComment(user?.id ?? null)
          .where(
            and(eq(commentTable.postId, id), isNull(commentTable.replyToId))
          )
          .orderBy(
            sort == "newest"
              ? orderFunc(commentTable.createdAt)
              : orderFunc(sql`like_count`),
            asc(commentTable.createdAt)
          )
          .limit(10)
          .offset((commentPageNumber - 1) * 10),
      ]);

      if (res.length == 0)
        return ApiRes.error({
          message: "No such post found",
          code: ApiError.PostNotFound,
        });
      const { likeCount, commentCount, ...data } = res[0];
      const poster = data.user ? exposeUserType(data.user) : null;
      const forum = data.forum!;

      let isLiked: boolean | null = user ? data.isLiked : null;

      return ApiRes.success({
        data: {
          poster,
          forum: {
            ...forum,
            isAdmin: user ? data.forumData.isAdmin : null,
            isOwner: user ? data.forumData.isOwner : null,
          },
          isLiked,
          initialComments: rawComments.map(
            ({ user, comment, likeCount, ...v }) => {
              let isLiked = user ? v.isLiked : null;
              return {
                commenter: user,
                likeCount,
                isLiked,
                replyCount: v.replyCount,
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

export const getPostByIdWithNoComment = cache(
  async (postId: string): Promise<ApiResponse<Post>> => {
    try {
      const { user } = await getAuth();
      const res = await fetchPost(user?.id ?? null).where(
        eq(postTable.id, postId)
      );
      if (res.length == 0) {
        return ApiRes.error({
          message: "No such post found",
          code: ApiError.PostNotFound,
        });
      }
      const v = res[0];
      const data: Post = {
        ...v.post,
        poster: v.user ? exposeUserType(v.user) : null,
        forum: {
          ...v.forum!,
          isAdmin: v.user ? v.forumData.isAdmin : null,
          isOwner: v.user ? v.forumData.isOwner : null,
        },
        isLiked: v.isLiked,
        likeCount: v.likeCount,
        commentCount: v.commentCount,
      };
      return ApiRes.success({
        data,
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

export function fetchPost(userId: string | null) {
  const safeId = userId ?? "11111111-1111-1111-1111-1ce992f5e2db";
  return db
    .select({
      likeCount: sql<number>`cast(${countDistinct(
        postLikeTable.userId
      )} as int) as like_count`,
      commentCount: countDistinct(commentTable),
      isLiked: sql<boolean>`SUM( CASE
      WHEN ${postLikeTable.userId} = ${safeId} THEN 1 ELSE 0 END) > 0`,
      user: { ...userTable },
      post: { ...postTable },
      forum: {
        ...forumTable,
      },
      forumData: {
        isOwner: sql<boolean>`${eq(forumTable.ownerId, safeId)}`,
        isAdmin: sql<boolean>`EXISTS ${createIsAdminSubQuery(safeId)}`,
      },
    })
    .from(postTable)
    .leftJoin(userTable, eq(userTable.id, postTable.posterId))
    .leftJoin(forumTable, eq(forumTable.id, postTable.forumId))
    .leftJoin(postLikeTable, eq(postLikeTable.postId, postTable.id))
    .leftJoin(
      commentTable,
      and(eq(commentTable.postId, postTable.id), isNull(commentTable.replyToId))
    )
    .groupBy(userTable.id, forumTable.id, postTable.id)
    .$dynamic();
}
