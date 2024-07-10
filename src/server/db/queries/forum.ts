import "server-only";
import { db } from "..";
import { count, eq } from "drizzle-orm";
import { forumMemberTable, forumTable } from "../schema/forum";
import { postLikeTable, postTable } from "../schema/post";
import { cache } from "react";
import { userTable } from "../schema";
import { exposeUserType, Forum, Post } from "../schema/types";
import { ApiRes, ApiResponse } from "@/server/apiResponse";
import { ApiError } from "@/server/apiErrors";
import { getAuth } from "@/server/auth";
import { isTuple } from "@/lib/utils.server";
import { commentTable } from "../schema/comment";

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
      const forum = await db.query.forumTable.findFirst({
        where: eq(forumTable.id, forumId),
      });

      if (!forum) {
        return ApiRes.error({
          message: "Forum not found",
          code: ApiError.ForumNotFound,
        });
      }

      return ApiRes.success({
        data: forum,
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
      const posts = await db
        .select()
        .from(postTable)
        .where(eq(postTable.forumId, forumId))
        .leftJoin(userTable, eq(postTable.posterId, userTable.id))
        .leftJoin(forumTable, eq(postTable.forumId, forumTable.id));

      const { user } = await getAuth();

      const likeCountQuery = posts.map((v) => {
        return db.query.postLikeTable.findMany({
          where: eq(postLikeTable.postId, v.post.id),
        });
      });

      const commentCountQuery = posts.map((v) => {
        return db
          .select({ count: count() })
          .from(commentTable)
          .where(eq(commentTable.postId, v.post.id));
      });

      if (!isTuple(likeCountQuery) || !isTuple(commentCountQuery)) {
        return ApiRes.error({
          message: "Failed to get user likes",
          code: ApiError.UnknownError,
        });
      }

      const batchedQuery = await db.batch([...likeCountQuery]);
      const commentCountRes = await db.batch(commentCountQuery);

      const a = posts.map((v, index): Post => {
        const poster = v.user ? exposeUserType(v.user) : null;
        const { name, id } = v.forum!;
        let isLiked: boolean | null = null;
        const postLikeData = batchedQuery[index];
        const likeCount = postLikeData.length;
        const commentCount =
          commentCountRes[index].length == 1
            ? commentCountRes[index][0].count
            : 0;
        if (user) {
          isLiked = !!postLikeData.find((p) => p.userId == user.id);
        }
        return {
          poster,
          forum: {
            name,
            id,
          },
          likeCount,
          isLiked,
          commentCount,
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
