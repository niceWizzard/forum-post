import {
  foreignKey,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { userTable } from ".";

export const forumTable = pgTable("forum", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 64 }).notNull().unique(),
  description: varchar("description", { length: 256 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  ownerId: uuid("owner_id").references(() => userTable.id, {
    onDelete: "set null",
  }),
});

export const postTable = pgTable("post", {
  id: uuid("id").primaryKey().defaultRandom(),
  posterId: uuid("poster_id").references(() => userTable.id, {
    onDelete: "set null",
  }),
  forumId: uuid("forum_id").references(() => forumTable.id, {
    onDelete: "cascade",
  }),
  title: varchar("title", { length: 64 }).notNull(),
  body: varchar("body", { length: 512 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const commentTable = pgTable(
  "comment",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    commenterId: uuid("commenter_id").references(() => userTable.id, {
      onDelete: "set null",
    }),
    postId: uuid("post_id").references(() => postTable.id, {
      onDelete: "cascade",
    }),
    replyToId: uuid("reply_to_id"),
    body: varchar("body", { length: 512 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    replyReference: foreignKey({
      columns: [table.replyToId],
      foreignColumns: [table.id],
    }),
  })
);

export const commentLikeTable = pgTable(
  "comment_like",
  {
    userId: uuid("user_id").references(() => userTable.id, {
      onDelete: "cascade",
    }),
    commentId: uuid("comment_id").references(() => commentTable.id, {
      onDelete: "cascade",
    }),
    likedAt: timestamp("liked_at").notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.commentId] }),
  })
);

export const postLikeTable = pgTable(
  "post_like",
  {
    userId: uuid("user_id").references(() => userTable.id, {
      onDelete: "cascade",
    }),
    postId: uuid("post_id").references(() => postTable.id, {
      onDelete: "cascade",
    }),
    likedAt: timestamp("liked_at").notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.postId] }),
  })
);
