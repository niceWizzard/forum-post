import "server-only";
import { db } from "..";
import { count, eq, and, countDistinct, sql, desc, isNull } from "drizzle-orm";
import { forumMemberTable, forumTable } from "../schema/forum";
import { postLikeTable, postTable } from "../schema/post";
import { cache } from "react";
import { userTable } from "../schema";
import { exposeUserType, Forum, Post, RawForum } from "../schema/types";
import { ApiRes, ApiResponse } from "@/server/apiResponse";
import { ApiError } from "@/server/apiErrors";
import { getAuth } from "@/server/auth";
import { isTuple } from "@/lib/utils.server";
import { commentLikeTable, commentTable } from "../schema/comment";
import { fetchPost } from "./post";

export const getJoinedForums = cache(async (userId: string) => {
  try {
    const joinedForums = await db.query.forumMemberTable.findMany({
      where: eq(forumMemberTable.userId, userId),
    });
    return ApiRes.success({
      data: joinedForums,
    });
  } catch (e) {
    const err = e as Error;
    return ApiRes.error({
      message: err.message,
      code: ApiError.UnknownError,
    });
  }
});

export const getCreatedForums = cache(async (userId: string) => {
  try {
    const createdForums = await db.query.forumTable.findMany({
      where: eq(forumTable.ownerId, userId),
    });

    return ApiRes.success({
      data: createdForums,
    });
  } catch (e) {
    const err = e as Error;
    return ApiRes.error({
      message: err.message,
      code: ApiError.UnknownError,
    });
  }
});

export const getForumById = cache(
  async (forumId: string): Promise<ApiResponse<Forum>> => {
    try {
      const { user } = await getAuth();
      const res = await db
        .select({
          forumMembersCount: count(forumMemberTable.userId),
          forum: { ...forumTable },
          isJoined: sql<boolean>`SUM( CASE
            WHEN ${forumMemberTable.userId} = ${
            user?.id ?? "11111111-1111-1111-1111-1ce992f5e2db"
          } THEN 1 ELSE 0 END) > 0 AS is_joined`,
        })
        .from(forumTable)
        .where(eq(forumTable.id, forumId))
        .leftJoin(forumMemberTable, eq(forumMemberTable.forumId, forumTable.id))
        .groupBy(forumTable.id);

      if (res.length == 0) {
        return ApiRes.error({
          message: "Forum not found",
          code: ApiError.ForumNotFound,
        });
      }

      let isJoined: boolean | null = user ? res[0].isJoined : null;
      return ApiRes.success({
        data: {
          forumMembersCount: res[0].forumMembersCount,
          isJoined,
          ...res[0].forum,
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

export const getForumPosts = cache(
  async (forumId: string): Promise<ApiResponse<Post[]>> => {
    try {
      const { user } = await getAuth();

      const posts = await fetchPost(user?.id).where(
        eq(postTable.forumId, forumId)
      );
      const a = posts.map((v, index): Post => {
        const poster = v.user ? exposeUserType(v.user) : null;
        const { name, id } = v.forum!;
        let isLiked = user ? v.isLiked : null;

        return {
          poster,
          forum: {
            name,
            id,
          },
          likeCount: v.likeCount,
          commentCount: v.commentCount,
          isLiked,
          ...v.post,
        };
      });

      return ApiRes.success({
        data: a,
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

export const getTrendingForums = cache(
  async (): Promise<ApiResponse<Forum[]>> => {
    try {
      const { user } = await getAuth();
      if (!user) {
        return ApiRes.error({
          message: "User not authenticated",
          code: ApiError.AuthRequired,
        });
      }

      const trendingForums = await db
        .select({
          forum: { ...forumTable },
          forumMemberCount: sql<number>`COUNT(DISTINCT ${forumMemberTable.userId}) AS forum_member_count`,
        })
        .from(forumTable)
        .leftJoin(forumMemberTable, eq(forumMemberTable.forumId, forumTable.id))
        .orderBy(desc(sql`forum_member_count`))
        .groupBy(forumTable.id)
        .limit(10);

      return ApiRes.success({
        data: trendingForums.map((v) => ({
          ...v.forum,
          forumMembersCount: v.forumMemberCount,
          isJoined: null,
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
