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
    if (!res.error && res.data) {
      router.push(`/post/${res.data.postId}`);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="bg-card px-6 py-4 flex flex-col gap-4"
      >
        <FormField
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Your great idea...." {...field} />
              </FormControl>
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
                <Input placeholder="This is...." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <LoadingButton
          type="submit"
          isLoading={hasSubmitted}
          loadingText="Creating..."
        >
          Create Post
        </LoadingButton>
      </form>
    </Form>
  );
}
