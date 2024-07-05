import "server-only";
import { db } from "..";
import { eq } from "drizzle-orm";
import { forumMemberTable, forumTable } from "../schema/forum";
import { postTable } from "../schema/post";
import { cache } from "react";
import { userTable } from "../schema";
import { exposeUserType, Forum, Post } from "../schema/types";
import { ApiRes, ApiResponse } from "@/server/apiResponse";
import { ApiError } from "@/server/apiErrors";

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

    if (posts.length == 0) {
      return ApiRes.error({
        message: "Forum not found",
        code: ApiError.ForumNotFound,
      });
    }

    const a = posts.map((v) => {
      const poster = v.user ? exposeUserType(v.user) : null;
      const { name, id } = v.forum!;
      return {
        poster,
        forum: {
          name,
          id,
        },
        ...v.post,
      };
    });

    return ApiRes.success({
      data: a,
    });
  }
);
