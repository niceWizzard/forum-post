import { z } from "zod";
import { getForumById, handleForumCheck } from "../db/queries/forum";
import { publicProcedure, router } from "./trpc";
import { getPostByIdWithNoComment } from "../db/queries/post";
import { Post } from "../db/schema/types";
import { handleUsernameCheck } from "../db/queries/user";
import { getCommentReplies } from "../db/queries/comment";

export const appRouter = router({
  getPost: publicProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ input }): Promise<Post> => {
      const res = await getPostByIdWithNoComment(input.postId);
      if (res.error) {
        throw new Error(res.message);
      }
      return res.data;
    }),
  nameAvailability: publicProcedure
    .input(
      z.object({
        type: z.enum(["forum", "username"]),
        name: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      const res = await (input.type == "forum"
        ? handleForumCheck(input.name)
        : handleUsernameCheck(input.name));
      return res;
    }),
  getCommentReplies: publicProcedure
    .input(z.string().min(1))
    .query(async ({ input: commentId }) => {
      const res = await getCommentReplies(commentId);
      if (res.error) {
        throw new Error(res.message);
      }
      return res.data;
    }),
});

export type AppRouter = typeof appRouter;
