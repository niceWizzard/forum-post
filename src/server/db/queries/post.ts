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
  async (id: string): Promise<ApiResponse<PostWithComments>> => {
    try {
      const [likeCount, res, rawComments, commentCountQueryRes] =
        await db.batch([
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
            .orderBy(asc(commentTable.createdAt))
            .limit(10)
            .offset(0)
            .leftJoin(userTable, eq(userTable.id, commentTable.commenterId)),
          db
            .select({ count: count() })
            .from(commentTable)
            .where(eq(commentTable.postId, id)),
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

      const commentLikeQuery = rawComments.map((c) =>
        db.query.commentLikeTable.findMany({
          where: eq(commentLikeTable.commentId, c.comment.id),
          columns: {
            commentId: true,
          },
        })
      );

      if (!isTuple(commentLikeQuery)) {
        return ApiRes.error({
          message: "Failed to get comment likes",
          code: ApiError.UnknownError,
        });
      }

      const individualCommentLikeCountRes = await db.batch(commentLikeQuery);

      return ApiRes.success({
        data: {
          poster,
          forum,
          isLiked,
          initialComments: rawComments.map(({ user, comment }) => ({
            commenter: user,
            likeCount: individualCommentLikeCountRes[0].length,
            ...comment,
          })),
          likeCount: likeCount.length,
          commentCount: commentCountQueryRes.length
            ? commentCountQueryRes[0].count
            : 0,
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
