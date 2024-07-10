import "server-only";
import { db } from "../index";
import { postLikeTable, postTable } from "../schema/post";
import { and, count, eq } from "drizzle-orm";
import { userTable } from "../schema";
import {
  exposeUserType,
  minimizeData,
  Post,
  PostWithComments,
  PrivateUser,
  User,
} from "../schema/types";
import { cache } from "react";
import { forumTable } from "../schema/forum";
import { getAuth } from "@/server/auth";
import { ApiRes, ApiResponse } from "@/server/apiResponse";
import { ApiError } from "@/server/apiErrors";
import { commentTable } from "../schema/comment";

export const getPostById = cache(
  async (id: string): Promise<ApiResponse<PostWithComments>> => {
    const [likeCount, res, rawComments] = await db.batch([
      db.select({}).from(postLikeTable).where(eq(postLikeTable.postId, id)),
      db
        .select({
          user: { ...userTable },
          forum: { ...forumTable },
          post: { ...postTable },
        })
        .from(postTable)
        .where(eq(postTable.id, id))
        .leftJoin(userTable, eq(userTable.id, postTable.posterId))
        .leftJoin(forumTable, eq(forumTable.id, postTable.forumId)),
      db
        .select()
        .from(commentTable)
        .where(eq(commentTable.postId, id))
        .leftJoin(userTable, eq(userTable.id, commentTable.commenterId)),
    ]);

    if (res.length == 0)
      return ApiRes.error({
        message: "No such post found",
        code: ApiError.PostNotFound,
      });

    const data = res[0];
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

    return ApiRes.success({
      data: {
        poster,
        forum,
        isLiked,
        comments: rawComments.map(({ user, comment }) => ({
          commenter: user,
          ...comment,
        })),
        likeCount: likeCount.length,
        ...data.post,
      },
    });
  }
);
