import "server-only";
import { cache } from "react";
import { getCreatedForums } from "@/server/db/queries/forum";
import { db } from "../index";
import { eq } from "drizzle-orm";
import { userTable } from "../schema";

export const getUser = cache(async (userId: string) => {
  return await db.query.userTable.findFirst({
    where: eq(userTable.id, userId),
  });
});

export const getUserProfile = cache(async (userId: string) => {
  const createdForums = await getCreatedForums(userId);
  const user = await getUser(userId);
  return {
    createdForums,
    user,
  };
});
