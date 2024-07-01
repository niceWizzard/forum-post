import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { userTable } from ".";

export const postTable = pgTable("post", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => userTable.id, {
    onDelete: "set null",
  }),
  title: varchar("title", { length: 64 }).notNull(),
  body: varchar("body", { length: 512 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const commentTable = pgTable("comment", {
  id: uuid("id").primaryKey().defaultRandom(),
  posterId: uuid("poster_id").references(() => userTable.id, {
    onDelete: "set null",
  }),
  postId: uuid("post_id").references(() => postTable.id, {
    onDelete: "cascade",
  }),
  body: varchar("body", { length: 512 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const commentLikeTable = pgTable("comment_like", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => userTable.id, {
      onDelete: "cascade",
    }),
  commentId: uuid("comment_id")
    .primaryKey()
    .references(() => commentTable.id, {
      onDelete: "cascade",
    }),
  likedAt: timestamp("liked_at").notNull().defaultNow(),
});

export const postLikeTable = pgTable("post_like", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => userTable.id, {
      onDelete: "cascade",
    }),
  postId: uuid("post_id")
    .primaryKey()
    .references(() => postTable.id, {
      onDelete: "cascade",
    }),
  likedAt: timestamp("liked_at").notNull().defaultNow(),
});
