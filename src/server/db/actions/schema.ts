import { z } from "zod";

export const forumCreateSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Forum name must be atleast 3 characters long." })
    .max(64, { message: "Forum name must not exceed 64 characters." }),
  description: z.string().max(512, {
    message: "Forum description must not exceed 512 characters",
  }),
});

export const postCreateFormSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Post title must be atleast 3 characters long." })
    .max(64, { message: "Post title must not exceed 64 characters" }),
  content: z
    .string()
    .min(1, { message: "Post content is required." })
    .max(10240, { message: "Post content must not exceed 10240 characters" }),
});
