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
import { LoadingButton } from "@/components/ui/loadingButton";
import { Textarea } from "@/components/ui/textarea";
import { Post } from "@/server/db/schema/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const commentFormSchema = z.object({
  comment: z
    .string()
    .min(1, "Comment is required.")
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

  const [hasSubmitted, setHasSubmitted] = useState(false);

  async function onSubmit(values: FormType) {}

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="py-4 flex flex-col gap-3"
      >
        <FormField
          name="comment"
          render={({ field }) => (
            <FormItem className="flex-grow flex flex-col">
              <FormLabel>Create a comment</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Comment something...."
                  className="resize-none flex-grow"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <LoadingButton
          type="submit"
          className="md:self-end"
          isLoading={hasSubmitted}
          loadingText="Creating..."
        >
          Create
        </LoadingButton>
      </form>
    </Form>
  );
}
