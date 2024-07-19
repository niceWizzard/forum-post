CREATE TABLE IF NOT EXISTS "forum_assign_admin" (
	"forum_id" uuid NOT NULL,
	"assigner_id" uuid NOT NULL,
	"new_admin_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "forum_assign_owner" (
	"forum_id" uuid NOT NULL,
	"assigner_id" uuid NOT NULL,
	"new_owner_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "forum_assign_admin" ADD CONSTRAINT "forum_assign_admin_forum_id_forum_id_fk" FOREIGN KEY ("forum_id") REFERENCES "public"."forum"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "forum_assign_admin" ADD CONSTRAINT "forum_assign_admin_assigner_id_user_id_fk" FOREIGN KEY ("assigner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "forum_assign_admin" ADD CONSTRAINT "forum_assign_admin_new_admin_id_user_id_fk" FOREIGN KEY ("new_admin_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "forum_assign_owner" ADD CONSTRAINT "forum_assign_owner_forum_id_forum_id_fk" FOREIGN KEY ("forum_id") REFERENCES "public"."forum"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "forum_assign_owner" ADD CONSTRAINT "forum_assign_owner_assigner_id_user_id_fk" FOREIGN KEY ("assigner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "forum_assign_owner" ADD CONSTRAINT "forum_assign_owner_new_owner_id_user_id_fk" FOREIGN KEY ("new_owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
