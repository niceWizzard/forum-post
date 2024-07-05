import { InferSelectModel } from "drizzle-orm";
import { forumTable } from "./forum";
import { postTable } from "./post";
import { userTable } from ".";

type StrictOmit<T, K extends keyof T> = Omit<T, K>;

export type Forum = InferSelectModel<typeof forumTable>;
export type Post = InferSelectModel<typeof postTable>;
export type PostWithPoster = Post & { poster: User | null };
export type PostComplete = PostWithPoster & {
  forum: Pick<Forum, "id" | "name">;
};
export type PrivateUser = InferSelectModel<typeof userTable>;
export type User = StrictOmit<PrivateUser, "github_id">;

export function exposeUserType(user: PrivateUser): User {
  const { github_id, ...output } = user;
  return output;
}
