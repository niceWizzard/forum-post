"use server";
import "server-only";
import { db } from "..";
import { forumMemberTable, forumTable } from "../schema";
import { eq } from "drizzle-orm";

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
