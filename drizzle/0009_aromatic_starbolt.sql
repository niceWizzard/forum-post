ALTER TABLE "comment" DROP CONSTRAINT "comment_reply_to_id_comment_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comment" ADD CONSTRAINT "comment_reply_to_id_comment_id_fk" FOREIGN KEY ("reply_to_id") REFERENCES "public"."comment"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
