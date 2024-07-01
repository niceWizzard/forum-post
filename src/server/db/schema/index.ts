import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export { postLikeTable, postTable } from "./post";

export { commentLikeTable, commentTable } from "./comment";

export { forumMemberTable, forumTable } from "./forum";

export const userTable = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").unique(),
  email: varchar("email", { length: 256 }).unique().notNull(),
  github_id: text("github_id").unique(),
  name: varchar("name", { length: 256 }),
});

export const sessionTable = pgTable("session", {
  id: text("id").notNull().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id),
  expiresAt: timestamp("expires_at").notNull(),
});
