import "server-only";
import { db } from "../index";
import { postTable } from "../schema/post";
import { eq } from "drizzle-orm";
import { userTable } from "../schema";
import { exposeUserType, Post, PrivateUser, User } from "../schema/types";

interface PostWithUser extends Post {
  poster: User | null;
}
export const getPostById = async <T extends boolean>(
  id: string,
  withOwner: T = false as T
): Promise<T extends true ? PostWithUser | null : Post | null> => {
  if (withOwner) {
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
    } as T extends true ? PostWithUser : Post;
  }

  const res = await db.select().from(postTable).where(eq(postTable.id, id));
  if (res.length == 0) return null;

  return res[0] as T extends true ? PostWithUser : Post;
};
