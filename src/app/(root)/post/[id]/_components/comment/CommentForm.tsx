import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { LoadingButton } from "@/components/ui/loadingButton";
import { Textarea } from "@/components/ui/textarea";
import { createComment } from "@/server/db/actions/comment";
import { Post } from "@/server/db/schema/types";
import { useUserStore } from "@/store/userStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const commentFormSchema = z.object({
  comment: z
    .string()
    .min(1, "Comment cannot be empty.")
    .max(512, "Comment must not exceed 512 characters"),
});

type FormType = z.infer<typeof commentFormSchema>;

export function CommentForm({ post }: { post: Post }) {
  const form = useForm<FormType>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      comment: "",
    },
  });

  const user = useUserStore((v) => v.user);
  const router = useRouter();

  const [hasSubmitted, setHasSubmitted] = useState(false);

  async function onSubmit(values: FormType) {
    if (!user) {
      router.push("/login");
      return;
    }
    setHasSubmitted(true);
    const res = await createComment({
      postId: post.id,
      commentBody: values.comment,
    });
    if (res.error) {
      toast.error("Could not post comment", {
        description: res.message,
      });
      setHasSubmitted(false);
      return;
    }
    setHasSubmitted(false);
    form.reset();
    toast.success("Comment added");
    router.refresh();
  }

  if (!user) {
    return (
      <div className="rounded-lg border border-border/80 bg-muted/30 p-4 text-center text-xs text-muted-foreground">
        <span>Please </span>
        <Link href="/login" className="font-semibold text-foreground underline underline-offset-4">
          log in
        </Link>
        <span> to participate in the conversation.</span>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="What are your thoughts?"
                  className="min-h-[80px] resize-y text-xs"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <LoadingButton
            type="submit"
            size="sm"
            isLoading={hasSubmitted}
            loadingText="Posting..."
            className="gap-1.5"
          >
            <Send className="h-3 w-3" />
            <span>Post Comment</span>
          </LoadingButton>
        </div>
      </form>
    </Form>
  );
}
