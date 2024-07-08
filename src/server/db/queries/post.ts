import "server-only";
import { db } from "../index";
import { postLikeTable, postTable } from "../schema/post";
import { and, count, eq } from "drizzle-orm";
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
import { getAuth } from "@/server/auth";

export const getPostById = cache(async (id: string) => {
  const res = await db
    .select({
      user: { ...userTable },
      forum: { ...forumTable },
      post: { ...postTable },
    })
    .from(postTable)
    .where(eq(postTable.id, id))
    .leftJoin(userTable, eq(userTable.id, postTable.posterId))
    .leftJoin(forumTable, eq(forumTable.id, postTable.forumId));

  if (res.length == 0) return null;

  const data = res[0];
  console.log(data);
  const poster = data.user ? exposeUserType(data.user) : null;
  const forum = minimizeData(data.forum!);

  let isLiked: boolean | null = null;

  const { user } = await getAuth();
  if (user) {
    const likeRes = await db.query.postLikeTable.findFirst({
      where: and(
        eq(postLikeTable.postId, data.post.id),
        eq(postLikeTable.userId, user.id)
      ),
    });
    isLiked = likeRes ? true : false;
  }

  const likeRes = await db.query.postLikeTable.findMany({
    where: eq(postLikeTable.postId, id),
  });

  return {
    poster,
    forum,
    isLiked,
    likeCount: likeRes.length,
    ...data.post,
  };
});
