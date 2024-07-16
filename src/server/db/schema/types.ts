import { InferSelectModel } from "drizzle-orm";
import { forumTable } from "./forum";
import { postTable } from "./post";
import { userTable } from ".";
import { commentTable } from "./comment";

type StrictOmit<T, K extends keyof T> = Omit<T, K>;

export type RawForum = InferSelectModel<typeof forumTable>;
export type Forum = RawForum & {
  forumMembersCount: number;
  isJoined: boolean | null;
};
export type MinimizedForum = Pick<RawForum, "id" | "name">;
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

export function isSortType(type?: string | null): type is SortType {
  if (!type) return false;
  return ["newest", "likes"].includes(type);
}

export function asSortType(type?: string | null): SortType {
  if (!isSortType(type)) return "likes";
  return type;
}

export function isSortOrder(order?: string | null): order is SortOrder {
  if (!order) return false;
  return ["up", "down"].includes(order);
}

export function asSortOrder(order?: string | null): SortOrder {
  if (!isSortOrder(order)) return "down";
  return order;
}

export type RawComment = InferSelectModel<typeof commentTable>;

export type Comment = RawComment & {
  commenter: User | null;
  likeCount: number;
  isLiked: boolean | null;
  replyCount: number;
};

export type ReplyComment = StrictOmit<Comment, "replyCount"> & {
  replyToId: string;
};

export type PrivateUser = InferSelectModel<typeof userTable>;
export type User = StrictOmit<PrivateUser, "github_id" | "google_id">;

export function exposeUserType(user: PrivateUser): User {
  const { github_id, ...output } = user;
  return {
    email: output.email,
    id: output.id,
    name: output.name,
    username: output.username,
  };
}

export function minimizeData(forum: Forum): MinimizedForum {
  const { id, name } = forum;
  return {
    id,
    name,
  };
}
