import { pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { userTable } from ".";
import { forumTable } from "./forum";

export const notificationTable = pgTable("notification", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id, {
      onDelete: "cascade",
    }),
  message: varchar("message", { length: 5024 }).notNull(),
  linkTo: varchar("link_to", { length: 5024 }),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const forumAssignOwnerTable = pgTable("forum_assign_owner", {
  forumId: uuid("forum_id")
    .notNull()
    .references(() => forumTable.id, {
      onDelete: "cascade",
    }),
  assignerId: uuid("assigner_id")
    .notNull()
    .references(() => userTable.id, {
      onDelete: "cascade",
    }),
  newOwnerId: uuid("new_owner_id")
    .notNull()
    .references(() => userTable.id, {
      onDelete: "cascade",
    }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const forumAssignAdminTable = pgTable("forum_assign_admin", {
  forumId: uuid("forum_id")
    .notNull()
    .references(() => forumTable.id, {
      onDelete: "cascade",
    }),
  assignerId: uuid("assigner_id")
    .notNull()
    .references(() => userTable.id, {
      onDelete: "cascade",
    }),
  newAdminId: uuid("new_admin_id")
    .notNull()
    .references(() => userTable.id, {
      onDelete: "cascade",
    }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
