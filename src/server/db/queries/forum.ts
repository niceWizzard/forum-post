import "server-only";
import { db } from "..";
import { eq } from "drizzle-orm";
import { forumMemberTable, forumTable } from "../schema/forum";
import { postTable } from "../schema/post";
import { cache } from "react";
import { userTable } from "../schema";
import { exposeUserType } from "../schema/types";

export const getJoinedForums = cache(async (userId: string) => {
  const joinedForums = await db.query.forumMemberTable.findMany({
    where: eq(forumMemberTable.userId, userId),
  });
  return joinedForums;
});

export const getCreatedForums = cache(async (userId: string) => {
  const createdForums = await db.query.forumTable.findMany({
    where: eq(forumTable.ownerId, userId),
  });

  return createdForums;
});

export const getForumById = cache(async (forumId: string) => {
  const forum = await db.query.forumTable.findFirst({
    where: eq(forumTable.id, forumId),
  });

  return forum;
});

export const getForumPosts = cache(async (forumId: string) => {
  const posts = await db
    .select()
    .from(postTable)
    .where(eq(postTable.forumId, forumId))
    .leftJoin(userTable, eq(postTable.posterId, userTable.id));

  return posts.map((v) => {
    const poster = v.user ? exposeUserType(v.user) : null;
    return {
      poster,
      ...v.post,
    };
  });
});
