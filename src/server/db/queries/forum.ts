import "server-only";
import { db } from "..";
import { and, eq } from "drizzle-orm";
import { forumMemberTable, forumTable } from "../schema/forum";
import { postLikeTable, postTable } from "../schema/post";
import { cache } from "react";
import { userTable } from "../schema";
import { exposeUserType, Forum, Post } from "../schema/types";
import { ApiRes, ApiResponse } from "@/server/apiResponse";
import { ApiError } from "@/server/apiErrors";
import { getAuth } from "@/server/auth";
import { isTuple } from "@/lib/utils.server";

export const getJoinedForums = cache(async (userId: string) => {
  const joinedForums = await db.query.forumMemberTable.findMany({
    where: eq(forumMemberTable.userId, userId),
  });
  return ApiRes.success({
    data: joinedForums,
  });
});

export const getCreatedForums = cache(async (userId: string) => {
  const createdForums = await db.query.forumTable.findMany({
    where: eq(forumTable.ownerId, userId),
  });

  return ApiRes.success({
    data: createdForums,
  });
});

export const getForumById = cache(
  async (forumId: string): Promise<ApiResponse<Forum>> => {
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
  }
);

export const getForumPosts = cache(
  async (forumId: string): Promise<ApiResponse<Post[]>> => {
    const posts = await db
      .select()
      .from(postTable)
      .where(eq(postTable.forumId, forumId))
      .leftJoin(userTable, eq(postTable.posterId, userTable.id))
      .leftJoin(forumTable, eq(postTable.forumId, forumTable.id));

    const { user } = await getAuth();

    const isLikeQuery = user
      ? posts.map((v) => {
          const query = db.query.postLikeTable.findFirst({
            where: and(
              eq(postLikeTable.userId, user.id),
              eq(postLikeTable.postId, v.post.id)
            ),
          });
          return query;
        })
      : [];

    const likeCountQuery = posts.map((v) => {
      return db.query.postLikeTable.findMany({
        where: eq(postLikeTable.postId, v.post.id),
      });
    });
    if (!isTuple(isLikeQuery) || !isTuple(likeCountQuery)) {
      return ApiRes.error({
        message: "Failed to get user likes",
        code: ApiError.UnknownError,
      });
    }

    const batchedIsLiked = await db.batch([...isLikeQuery]);
    const batchedLikeCount = await db.batch([...likeCountQuery]);

    const a = posts.map((v, index): Post => {
      const poster = v.user ? exposeUserType(v.user) : null;
      const { name, id } = v.forum!;
      let isLiked: boolean | null = null;
      let likeCount = batchedLikeCount[index].length;
      if (user) {
        isLiked = !!batchedIsLiked[index];
      }
      return {
        poster,
        forum: {
          name,
          id,
        },
        likeCount,
        isLiked,
        ...v.post,
      };
    });

    return ApiRes.success({
      data: a,
    });
  }
);
