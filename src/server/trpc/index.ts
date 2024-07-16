import { z } from "zod";
import { getForumById, handleForumCheck } from "../db/queries/forum";
import { publicProcedure, router } from "./trpc";
import { getPostByIdWithNoComment } from "../db/queries/post";
import { Post } from "../db/schema/types";
import { handleUsernameCheck } from "../db/queries/user";

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
});

export type AppRouter = typeof appRouter;
