import { InferSelectModel } from "drizzle-orm";
import { forumTable } from "./forum";
import { postTable } from "./post";
import { userTable } from ".";

type StrictOmit<T, K extends keyof T> = Omit<T, K>;

export type Forum = InferSelectModel<typeof forumTable>;
export type MinimizedForum = Pick<Forum, "id" | "name">;
export type Post = InferSelectModel<typeof postTable> & {
  forum: MinimizedForum;
  poster: User | null;
  isLiked: boolean | null;
};
export type PrivateUser = InferSelectModel<typeof userTable>;
export type User = StrictOmit<PrivateUser, "github_id">;

export function exposeUserType(user: PrivateUser): User {
  const { github_id, ...output } = user;
  return output;
}

export function minimizeData(forum: Forum): MinimizedForum {
  const { id, name } = forum;
  return {
    id,
    name,
  };
}
