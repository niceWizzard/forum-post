import { ApiError } from "@/server/apiErrors";
import { NextApiRes, NextApiResponse } from "@/server/apiResponse";
import { db } from "@/server/db";
import { userTable } from "@/server/db/schema";
import { commentTable } from "@/server/db/schema/comment";
import { exposeUserType, ReplyComment } from "@/server/db/schema/types";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest
): Promise<NextApiResponse<ReplyComment[]>> {
  try {
    const commentId = req.nextUrl.searchParams.get("commentId");
    if (!commentId)
      return NextApiRes.error({
        message: "Missing commentId parameter",
        code: ApiError.MissingParameter,
      });
    const res = await db
      .select({
        reply: { ...commentTable },
        commenter: { ...userTable },
      })
      .from(commentTable)
      .leftJoin(userTable, eq(userTable.id, commentTable.commenterId))
      .where(eq(commentTable.replyToId, commentId));
    return NextApiRes.success({
      data: res.map((v) => ({
        commenter: v.commenter ? exposeUserType(v.commenter) : null,
        isLiked: null,
        likeCount: 0,
        ...v.reply,
        replyToId: commentId,
      })),
    });
  } catch (e) {
    const err = e as Error;
    return NextApiRes.error({
      message: err.message,
      code: ApiError.UnknownError,
    });
  }
}
