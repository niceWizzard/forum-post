import { InferSelectModel } from "drizzle-orm";
import { forumTable } from "./forum";
import { postTable } from "./post";

export type Forum = InferSelectModel<typeof forumTable>;
export type Post = InferSelectModel<typeof postTable>;
