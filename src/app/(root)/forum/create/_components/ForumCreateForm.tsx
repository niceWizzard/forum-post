"use client";
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
import { cn } from "@/lib/utils";
import { checkForumNameAvailability } from "@/server/db/actions/forum";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { Loader2, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDebouncedCallback } from "use-debounce";
import { z } from "zod";

const formSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Forum name must be atleast 3 characters long." })
    .max(64, { message: "Forum name must not exceed 64 characters." }),
  description: z.string().max(512, {
    message: "Forum description must not exceed 512 characters",
  }),
});

type ForumSchema = z.infer<typeof formSchema>;

function ForumCreateForm() {
  const form = useForm<ForumSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const {
    reset,
    fetching,
    finish,
    state,
    data: forumNameAvailable,
  } = useForumNameCheckStatus();

  function onSubmit(values: ForumSchema) {}

  const forumNameCheck = useDebouncedCallback(async (forumName: string) => {
    if (!forumName.trim() || forumName.length < 3) {
      reset();
      return;
    }
    fetching();
    const a = await checkForumNameAvailability(forumName);
    if (a.error) {
      reset();
    } else {
      finish(a.data ?? false);
    }
  }, 300);

  function ForumNameAvailability() {
    if (state == Status.Finished) {
      return (
        <p
          className={cn(
            clsx({
              "text-green-400": forumNameAvailable,
              "text-destructive-foreground": !forumNameAvailable,
            })
          )}
        >
          Forum is {forumNameAvailable ? "available" : "already taken."}
        </p>
      );
    }
    if (state == Status.Loading) {
      return (
        <span className="flex items-center">
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Checking forum
          name...
        </span>
      );
    }

    return null;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Forum name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Form name"
                  {...field}
                  onChangeCapture={async (e) =>
                    await forumNameCheck(e.currentTarget.value)
                  }
                />
              </FormControl>
              <ForumNameAvailability />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Forum Description</FormLabel>
              <FormControl>
                <Input placeholder="This is the forum for...." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="md:self-end">
          Create forum
        </Button>
      </form>
    </Form>
  );
}

export default ForumCreateForm;

enum Status {
  Unset,
  Loading,
  Finished,
}
function useForumNameCheckStatus() {
  const [state, setState] = useState(Status.Unset);
  const [data, setData] = useState(false);

  function fetching() {
    setState(Status.Loading);
  }

  function finish(availability: boolean) {
    setState(Status.Finished);
    setData(availability);
  }

  function reset() {
    setState(Status.Unset);
  }

  return {
    state,
    data,
    fetching,
    reset,
    finish,
  };
}
