"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { postCreateFormSchema } from "@/server/db/actions/schema";
import { createForumPost } from "@/server/db/actions/post";
import { useRouter } from "next/navigation";
import { LoadingButton } from "@/components/ui/loadingButton";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Props {
  forumId: string;
}

type FormSchema = z.infer<typeof postCreateFormSchema>;

export default function PostCreateForm({ forumId }: Props) {
  const form = useForm<FormSchema>({
    resolver: zodResolver(postCreateFormSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const router = useRouter();
  const [hasSubmitted, setHasSubmitted] = useState(false);

  async function onSubmit(values: FormSchema) {
    const { title, content } = values;
    setHasSubmitted(true);
    const res = await createForumPost({
      title,
      content,
      forumId,
    });
    if (res.error) {
      setHasSubmitted(false);
      toast.error("Could not publish post", {
        description: res.message,
      });
    } else if (res.data) {
      toast.success("Post published successfully");
      router.push(`/post/${res.data.postId}`);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="What would you like to discuss?"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-xs">
                Be specific and clear with your discussion title.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write the details of your post here..."
                  className="min-h-[180px] resize-y leading-relaxed"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/forum/${forumId}`}>Cancel</Link>
          </Button>
          <LoadingButton
            type="submit"
            isLoading={hasSubmitted}
            loadingText="Publishing..."
          >
            Publish Post
          </LoadingButton>
        </div>
      </form>
    </Form>
  );
}
