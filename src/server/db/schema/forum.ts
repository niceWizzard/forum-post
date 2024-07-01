import {
  foreignKey,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { userTable } from "./index";

export const forumTable = pgTable("forum", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 64 }).notNull().unique(),
  description: varchar("description", { length: 256 }).notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  ownerId: uuid("owner_id").references(() => userTable.id, {
    onDelete: "set null",
  }),
});

export const forumMemberTable = pgTable(
  "forum_member",
  {
    forumId: uuid("forum_id").references(() => forumTable.id, {
      onDelete: "cascade",
    }),
    userId: uuid("user_id").references(() => userTable.id, {
      onDelete: "cascade",
    }),
    joinedAt: timestamp("joined_at").notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.forumId, table.userId] }),
  })
);
