import "server-only";
import { db } from "..";
import { eq } from "drizzle-orm";
import { forumMemberTable, forumTable } from "../schema/forum";
import { postTable } from "../schema/post";

export async function getJoinedForums(userId: string) {
  const joinedForums = await db.query.forumMemberTable.findMany({
    where: eq(forumMemberTable.userId, userId),
  });
  return joinedForums;
}

export async function getCreatedForums(userId: string) {
  const createdForums = await db.query.forumTable.findMany({
    where: eq(forumTable.ownerId, userId),
  });

  return createdForums;
}

export async function getForumById(forumId: string) {
  const forum = await db.query.forumTable.findFirst({
    where: eq(forumTable.id, forumId),
  });

  return forum;
}

export async function getForumPosts(forumId: string) {
  const posts = await db.query.postTable.findMany({
    where: eq(postTable.forumId, forumId),
  });

  return posts;
}
