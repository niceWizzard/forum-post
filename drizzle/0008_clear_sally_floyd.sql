ALTER TABLE "comment_like" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "comment_like" ALTER COLUMN "comment_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "comment" ALTER COLUMN "post_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "forum_member" ALTER COLUMN "forum_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "forum_member" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "post_like" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "post_like" ALTER COLUMN "post_id" SET NOT NULL;