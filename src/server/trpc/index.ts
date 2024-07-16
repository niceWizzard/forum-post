import { z } from "zod";
import { getForumById } from "../db/queries/forum";
import { publicProcedure, router } from "./trpc";
import { getPostByIdWithNoComment } from "../db/queries/post";
import { Post } from "../db/schema/types";

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
});

export type AppRouter = typeof appRouter;
