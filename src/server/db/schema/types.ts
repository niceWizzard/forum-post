import { InferSelectModel } from "drizzle-orm";
import { forumTable } from "./forum";
import { postTable } from "./post";
import { userTable } from ".";
import { commentTable } from "./comment";

type StrictOmit<T, K extends keyof T> = Omit<T, K>;

export type Forum = InferSelectModel<typeof forumTable>;
export type MinimizedForum = Pick<Forum, "id" | "name">;
export type Post = InferSelectModel<typeof postTable> & {
  forum: MinimizedForum;
  poster: User | null;
  isLiked: boolean | null;
  likeCount: number;
  commentCount: number;
};
export type PostWithComments = Post & {
  initialComments: Comment[];
};

export type SortType = "newest" | "likes";

export type SortOrder = "up" | "down";

export function isSortType(type?: string): type is SortType {
  if (!type) return false;
  return ["newest", "likes"].includes(type);
}

export function asSortType(type?: string): SortType {
  if (!isSortType(type)) return "likes";
  return type;
}

export function isSortOrder(order?: string): order is SortOrder {
  if (!order) return false;
  return ["up", "down"].includes(order);
}

export function asSortOrder(order?: string): SortOrder {
  if (!isSortOrder(order)) return "down";
  return order;
}

export type RawComment = InferSelectModel<typeof commentTable>;

export type Comment = RawComment & {
  commenter: User | null;
  likeCount: number;
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
