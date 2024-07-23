import "server-only";
import { db } from "..";
import {
  count,
  eq,
  and,
  countDistinct,
  sql,
  desc,
  isNull,
  asc,
} from "drizzle-orm";
import { forumAdminTable, forumMemberTable, forumTable } from "../schema/forum";
import { postLikeTable, postTable } from "../schema/post";
import { cache } from "react";
import { userTable } from "../schema";
import {
  exposeUserType,
  Forum,
  ForumAdmin,
  Post,
  RawForum,
  SortOrder,
  SortType,
  User,
} from "../schema/types";
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

export const createIsAdminSubQuery = (userId: string) =>
  db
    .select({})
    .from(forumAdminTable)
    .where(
      and(
        eq(forumAdminTable.forumId, forumTable.id),
        eq(forumAdminTable.adminId, userId),
        eq(forumAdminTable.status, "accepted")
      )
    )
    .as("isAdmin");

export function fetchForum(userId: string | null) {
  const id = userId ?? "11111111-1111-1111-1111-1ce992f5e2db";
  const postCountSubQuery = db
    .select({ count: count() })
    .from(postTable)
    .where(eq(postTable.forumId, forumTable.id))
    .as("post_count_subquery");
  return db
    .select({
      forumMembersCount: sql<number>`${count(
        forumMemberTable.userId
      )} as forum_members_count`,
      postCount: sql<number>`${postCountSubQuery}`,
      forum: { ...forumTable },
      isJoined: sql<boolean>`SUM( CASE
      WHEN ${forumMemberTable.userId} = ${id} THEN 1 ELSE 0 END) > 0 AS is_joined`,
      isOwner: sql<boolean>`${eq(forumTable.ownerId, id)}`,
      isAdmin: sql<boolean>`EXISTS ${createIsAdminSubQuery(id)}`,
    })
    .from(forumTable)
    .leftJoin(forumMemberTable, eq(forumMemberTable.forumId, forumTable.id))
    .groupBy(forumTable.id)
    .$dynamic();
}

export const getForumById = cache(
  async (forumId: string): Promise<ApiResponse<Forum>> => {
    try {
      const { user } = await getAuth();
      const res = await fetchForum(user?.id ?? null).where(
        eq(forumTable.id, forumId)
      );

      if (res.length == 0) {
        return ApiRes.error({
          message: "Forum not found",
          code: ApiError.ForumNotFound,
        });
      }
      ``;
      let isJoined: boolean | null = user ? res[0].isJoined : null;
      const isAdmin = user ? res[0].isAdmin : null;
      const isOwner = user ? res[0].isOwner : null;
      return ApiRes.success({
        data: {
          forumMembersCount:
            res[0].forumMembersCount * Math.ceil(10000 * Math.random()),
          postCount: res[0].postCount,
          isJoined,
          ...res[0].forum,
          isAdmin,
          isOwner,
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
  async ({
    forumId,
    sortOrder,
    sortType,
  }: {
    forumId: string;
    sortOrder: SortOrder;
    sortType: SortType;
  }): Promise<ApiResponse<Post[]>> => {
    try {
      const { user } = await getAuth();

      const orderFunc = sortOrder == "down" ? desc : asc;
      const posts = await fetchPost(user?.id ?? null)
        .where(eq(postTable.forumId, forumId))
        .limit(20)
        .offset(0)
        .orderBy(
          sortType == "likes"
            ? orderFunc(sql`like_count`)
            : orderFunc(postTable.createdAt)
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
            isAdmin: null,
            isOwner: null,
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

      const trendingForums = await fetchForum(user?.id)
        .orderBy(desc(sql`forum_members_count`))
        .limit(10);

      return ApiRes.success({
        data: trendingForums.map((v) => ({
          ...v.forum,
          forumMembersCount:
            v.forumMembersCount * Math.ceil(10000 * Math.random()),
          postCount: v.postCount,
          isJoined: user ? v.isJoined : null,
          isAdmin: user ? v.isAdmin : null,
          isOwner: user ? v.isOwner : null,
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

export async function handleForumCheck(name: string) {
  const res = await db.query.forumTable.findFirst({
    where: eq(forumTable.name, name),
  });

  return res == null;
}

export const getForumAdmins = cache(
  async ({
    logginnedUserId,
    forumId,
  }: {
    logginnedUserId: string;
    forumId: string;
  }): Promise<ApiResponse<ForumAdmin[]>> => {
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
      if (logginnedUserId !== forum.ownerId) {
        return ApiRes.error({
          message: "Only the owner can see the admins.",
          code: ApiError.Unathorized,
        });
      }
      const admins = await fetchForumAdmin().where(
        eq(forumAdminTable.forumId, forumId)
      );

      const a = admins
        .filter((v) => v.user != null)
        .map((v) => ({
          ...(v.user ? exposeUserType(v.user) : {}),
          status: v.status,
        }));
      return ApiRes.success({
        data: a as unknown as ForumAdmin[],
      });
    } catch (e) {
      const error = e as Error;
      return ApiRes.error({
        message: error.message,
        code: ApiError.UnknownError,
      });
    }
  }
);

export const getRawForumById = cache(async (forumId: string) => {
  return db.query.forumTable.findFirst({
    where: eq(forumTable.id, forumId),
  });
});

export function fetchForumAdmin() {
  return db
    .select({
      user: { ...userTable },
      status: forumAdminTable.status,
    })
    .from(forumAdminTable)
    .leftJoin(userTable, eq(forumAdminTable.adminId, userTable.id));
}

export const getForumAdminInvite = cache(
  async (forumId: string): Promise<ApiResponse<ForumAdmin>> => {
    const { user } = await getAuth();
    if (!user) {
      return ApiRes.error({
        message: "User not authenticated",
        code: ApiError.AuthRequired,
      });
    }

    try {
      const res = await fetchForumAdmin().where(
        and(
          eq(forumAdminTable.forumId, forumId),
          eq(forumAdminTable.adminId, user.id)
        )
      );
      if (res.length == 0) {
        return ApiRes.error({
          message: "You are not an admin of this forum",
          code: ApiError.Unathorized,
        });
      }

      const invite = res[0];
      if (invite.user == null) {
        return ApiRes.error({
          message: "You are not an admin of this forum",
          code: ApiError.Unathorized,
        });
      }
      return ApiRes.success({
        data: {
          ...exposeUserType(invite.user),
          status: invite.status,
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
