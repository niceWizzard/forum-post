import {
  foreignKey,
  integer,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { userTable } from "./index";
import { postTable } from "./post";

export const commentTable = pgTable(
  "comment",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    commenterId: uuid("commenter_id").references(() => userTable.id, {
      onDelete: "set null",
    }),
    postId: uuid("post_id")
      .notNull()
      .references(() => postTable.id, {
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
    }).onDelete("cascade"),
  })
);

export const commentLikeTable = pgTable(
  "comment_like",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => userTable.id, {
        onDelete: "cascade",
      }),
    commentId: uuid("comment_id")
      .notNull()
      .references(() => commentTable.id, {
        onDelete: "cascade",
      }),
    likedAt: timestamp("liked_at").notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.commentId] }),
  })
);
