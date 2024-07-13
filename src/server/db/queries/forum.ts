import "server-only";
import { db } from "..";
import { count, eq, and, countDistinct, sql } from "drizzle-orm";
import { forumMemberTable, forumTable } from "../schema/forum";
import { postLikeTable, postTable } from "../schema/post";
import { cache } from "react";
import { userTable } from "../schema";
import { exposeUserType, Forum, Post } from "../schema/types";
import { ApiRes, ApiResponse } from "@/server/apiResponse";
import { ApiError } from "@/server/apiErrors";
import { getAuth } from "@/server/auth";
import { isTuple } from "@/lib/utils.server";
import { commentLikeTable, commentTable } from "../schema/comment";

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
      const { user } = await getAuth();

      const posts = await db
        .select({
          user: { ...userTable },
          post: { ...postTable },
          forum: { ...forumTable },
          post_like: { ...postLikeTable },
          likeCount: countDistinct(postLikeTable.postId),
          commentCount: count(commentTable)
        })

        .from(postTable)
        .where(eq(postTable.forumId, forumId))
        .leftJoin(userTable, eq(postTable.posterId, userTable.id))
        .leftJoin(forumTable, eq(postTable.forumId, forumTable.id))
        .leftJoin(postLikeTable, eq(postLikeTable.postId, postTable.id))
        .leftJoin(commentTable, eq(commentTable.postId, postTable.id))
        .groupBy(postTable.id, userTable.id, forumTable.id, postLikeTable.userId, postLikeTable.postId);

      const a = posts.map((v, index): Post => {
        const poster = v.user ? exposeUserType(v.user) : null;
        const { name, id } = v.forum!;
        let isLiked: boolean | null = null;

        if (user) {
          isLiked = !!v.post_like;
        }
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
