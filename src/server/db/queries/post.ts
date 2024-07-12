import "server-only";
import { db } from "../index";
import { postLikeTable, postTable } from "../schema/post";
import { and, asc, count, eq } from "drizzle-orm";
import { userTable } from "../schema";
import {
  exposeUserType,
  minimizeData,
  PostWithComments,
} from "../schema/types";
import { cache } from "react";
import { forumTable } from "../schema/forum";
import { getAuth } from "@/server/auth";
import { ApiRes, ApiResponse } from "@/server/apiResponse";
import { ApiError } from "@/server/apiErrors";
import { commentLikeTable, commentTable } from "../schema/comment";
import { isTuple } from "@/lib/utils.server";

export const getPostById = cache(
  async (
    id: string,
    commentPageNumber: number
  ): Promise<ApiResponse<PostWithComments>> => {
    const { user } = await getAuth();
    console.log(commentPageNumber);
    try {
      const [res, rawComments] = await db.batch([
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
          .orderBy(asc(commentTable.createdAt))
          .limit(10)
          .offset((commentPageNumber - 1) * 10)
          .leftJoin(userTable, eq(userTable.id, commentTable.commenterId))
          .leftJoin(
            commentLikeTable,
            and(
              eq(commentLikeTable.commentId, commentTable.id),
              eq(
                commentLikeTable.userId,
                user?.id ?? "11111111-1111-1111-1111-1ce992f5e2db" // Some nonsense uuid just to not have an error.
              )
            )
          ),
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
          initialComments: {
            comments: rawComments.map(({ user, comment, comment_like }) => {
              let isLiked = null;
              if (user) {
                isLiked = !!comment_like;
              }
              return {
                commenter: user,
                isLiked,
                ...comment,
              };
            }),
          },
          ...data.post,
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
