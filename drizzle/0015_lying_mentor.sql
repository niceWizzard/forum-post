DO $$ BEGIN
 CREATE TYPE "public"."admin_status" AS ENUM('accepted', 'rejected', 'pending');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "forum_admin" ADD COLUMN "status" "admin_status" DEFAULT 'pending' NOT NULL;