import { z } from "zod";
import {
  getForumAdmins,
  getForumById,
  handleForumCheck,
} from "../db/queries/forum";
import { publicProcedure, router } from "./trpc";
import { getPostByIdWithNoComment } from "../db/queries/post";
import { Post } from "../db/schema/types";
import { handleUsernameCheck, searchUserToSetAdmin } from "../db/queries/user";
import { getCommentById, getCommentReplies } from "../db/queries/comment";
import { getNotifications } from "../db/queries/notifications";
import { getAuth } from "../auth";

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
  getComment: publicProcedure
    .input(z.string().min(1))
    .query(async ({ input: commentId }) => {
      const res = await getCommentById(commentId);
      if (res.error) {
        throw new Error(res.message);
      }
      return res.data;
    }),
  getNotifications: publicProcedure.query(async () => {
    const { user } = await getAuth();
    if (!user) {
      return null;
    }
    const res = await getNotifications(user.id);
    if (res.error) {
      throw new Error(res.message);
    }
    return res.data;
  }),
  searchUsername: publicProcedure
    .input(
      z.object({
        username: z.string(),
        forumId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { user } = await getAuth();
      if (!user) {
        throw new Error("Please login");
      }
      const res = await searchUserToSetAdmin(
        input.username,
        input.forumId,
        user.id
      );
      if (res.error) throw new Error(res.message);
      return res.data;
    }),
  getForumAdmins: publicProcedure
    .input(z.string().min(1, "Forum id is required."))
    .query(async ({ input: forumId }) => {
      const { user } = await getAuth();
      if (!user) throw new Error("Please login.");
      const res = await getForumAdmins({
        logginnedUserId: user.id,
        forumId,
      });
      if (res.error) throw new Error(res.message);
      return res.data;
    }),
});

export type AppRouter = typeof appRouter;
