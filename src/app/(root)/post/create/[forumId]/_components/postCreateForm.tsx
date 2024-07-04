"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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

interface Props {
  forumId: string;
}

const postCreateFormSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Post title must be atleast 3 characters long." })
    .max(64, { message: "Post title must not exceed 64 characters" }),
  content: z
    .string()
    .min(1, { message: "Post content is required." })
    .max(512, { message: "Post content must not exceed 512 characters" }),
});

type FormSchema = z.infer<typeof postCreateFormSchema>;

export default function PostCreateForm({ forumId }: Props) {
  const form = useForm<FormSchema>({
    resolver: zodResolver(postCreateFormSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  async function onSubmit(values: FormSchema) {
    console.log("onSubmit");
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
        <Button type="submit">Create Post</Button>
      </form>
    </Form>
  );
}
