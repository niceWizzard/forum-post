import {
  foreignKey,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { userTable } from "./index";
import { forumTable } from "./forum";

export const postTable = pgTable("post", {
  id: uuid("id").primaryKey().defaultRandom(),
  posterId: uuid("poster_id").references(() => userTable.id, {
    onDelete: "set null",
  }),
  forumId: uuid("forum_id")
    .notNull()
    .references(() => forumTable.id, {
      onDelete: "cascade",
    }),
  title: varchar("title", { length: 64 }).notNull(),
  body: varchar("body", { length: 512 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const postLikeTable = pgTable("post_like", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => userTable.id, {
    onDelete: "cascade",
  }),
  postId: uuid("post_id").references(() => postTable.id, {
    onDelete: "cascade",
  }),
  likedAt: timestamp("liked_at").notNull().defaultNow(),
});
