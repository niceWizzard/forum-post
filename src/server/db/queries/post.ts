import "server-only";
import { db } from "../index";
import { postTable } from "../schema/post";
import { eq } from "drizzle-orm";
import { userTable } from "../schema";
import {
  exposeUserType,
  minimizeData,
  Post,
  PrivateUser,
  User,
} from "../schema/types";
import { cache } from "react";
import { forumTable } from "../schema/forum";

export const getPostById = cache(async (id: string) => {
  const res = await db
    .select()
    .from(postTable)
    .where(eq(postTable.id, id))
    .leftJoin(userTable, eq(userTable.id, postTable.posterId))
    .leftJoin(forumTable, eq(forumTable.id, postTable.forumId));
  if (res.length == 0) return null;

  const data = res[0];
  const poster = data.user ? exposeUserType(data.user) : null;
  const forum = minimizeData(data.forum!);

  return {
    poster,
    forum,
    ...data.post,
  };
});
