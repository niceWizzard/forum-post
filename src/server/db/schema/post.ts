import {
  integer,
  pgTable,
  primaryKey,
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
  body: varchar("body", { length: 10240 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const postLikeTable = pgTable(
  "post_like",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => userTable.id, {
        onDelete: "cascade",
      }),
    postId: uuid("post_id")
      .notNull()
      .references(() => postTable.id, {
        onDelete: "cascade",
      }),
    likedAt: timestamp("liked_at").notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.postId] }),
  })
);
