import { pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { userTable } from ".";

export const notificationType = pgEnum("notification_type", [
  "forumAssignAdmin",
  "forumAssignOwner",
]);

export const notificationTable = pgTable("notification", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id, {
      onDelete: "cascade",
    }),
  message: varchar("link_to", { length: 5024 }).notNull(),
  type: notificationType("type").notNull(),
  linkTo: varchar("link_to", { length: 5024 }).notNull(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
