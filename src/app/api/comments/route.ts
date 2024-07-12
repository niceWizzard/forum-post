import { ApiError } from "@/server/apiErrors";
import { NextApiRes, NextApiResponse } from "@/server/apiResponse";
import { getAuth } from "@/server/auth";
import { db } from "@/server/db";
import { userTable } from "@/server/db/schema";
import { commentLikeTable, commentTable } from "@/server/db/schema/comment";
import { postTable } from "@/server/db/schema/post";
import {
  exposeUserType,
  PaginatedComments,
  type Comment,
} from "@/server/db/schema/types";
import { and, asc, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest
): Promise<NextApiResponse<PaginatedComments>> {
  const searchParams = req.nextUrl.searchParams;
  const postId = searchParams.get("postId");
  const pageString = searchParams.get("page");
  if (!postId || !pageString || !Number.isInteger(Number(pageString))) {
    console.log(!!postId, !!pageString, !!Number.isInteger(pageString));
    return NextApiRes.error({
      message: "Missing required parameters",
      code: ApiError.MissingParameter,
    });
  }
  try {
    const { user } = await getAuth();
    if (!user) {
      return NextApiRes.error({
        message: "Please login",
        code: ApiError.AuthRequired,
      });
    }

    const page = Number(pageString);

    const post = await db.query.postTable.findFirst({
      where: eq(postTable.id, postId),
    });
    if (!post) {
      return NextApiRes.error({
        message: "Post not found",
        code: ApiError.PostNotFound,
      });
    }

    const res = await db
      .select()
      .from(commentTable)
      .orderBy(asc(commentTable.createdAt))
      .limit(11)
      .offset(page * 11)
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
      );

    const hasNext = res.length == 11;
    if (hasNext) res.pop();

    const comments: Comment[] = res.map((c) => {
      let isLiked: boolean | null = null;

      return {
        isLiked,
        commenter: c.user ? exposeUserType(c.user) : null,
        ...c.comment,
      };
    });

    return NextApiRes.success({ data: { comments, hasNext } });
  } catch (e) {
    const err = e as Error;
    return NextApiRes.error({
      message: err.message,
      code: ApiError.UnknownError,
    });
  }
}
