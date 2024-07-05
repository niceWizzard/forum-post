import "server-only";
import { db } from "../index";
import { postTable } from "../schema/post";
import { eq } from "drizzle-orm";
import { userTable } from "../schema";
import { exposeUserType, Post, PrivateUser, User } from "../schema/types";
import { cache } from "react";
import { forumTable } from "../schema/forum";

interface PostWithUser extends Post {
  poster: User | null;
}
export const getPostById = cache(async (id: string) => {
  const res = await db
    .select()
    .from(postTable)
    .where(eq(postTable.id, id))
    .leftJoin(userTable, eq(userTable.id, postTable.posterId));
  if (res.length == 0) return null;

  const data = res[0];
  const poster = data.user ? exposeUserType(data.user) : null;

  return {
    poster,
    ...data.post,
  };
});
