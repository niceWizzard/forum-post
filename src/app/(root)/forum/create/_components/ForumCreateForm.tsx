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
import { ApiResponse } from "@/server/apiResponse";
import { createForum } from "@/server/db/actions/forum";
import { useUserStore } from "@/store/userStore";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { Loader2, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
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

function ForumCreateForm({ userId }: { userId: string }) {
  const form = useForm<ForumSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const [hasSubmitted, setHasSubmitted] = useState(false);

  const {
    reset,
    fetching,
    finish,
    state,
    data: forumNameAvailable,
  } = useForumNameCheckStatus();

  const router = useRouter();

  async function onSubmit(values: ForumSchema) {
    if (
      state == Status.Loading ||
      state == Status.Unset ||
      !forumNameAvailable ||
      hasSubmitted
    ) {
      return;
    }
    setHasSubmitted(true);
    const res = await createForum({
      forumDesc: values.description,
      forumName: values.name,
      userId,
    });
    if (!res.error) {
      router.push("/feed");
    }
  }

  const forumNameCheck = useDebouncedCallback(async (forumName: string) => {
    if (!forumName.trim() || forumName.length < 3) {
      reset();
      return;
    }
    fetching();
    const url = new URL("api/name-availability", "http://localhost:3000");
    url.searchParams.append("type", "forum");
    url.searchParams.append("name", forumName);
    const a: ApiResponse<boolean> = await (await fetch(url)).json();
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
        <Button type="submit" className="md:self-end" disabled={hasSubmitted}>
          {hasSubmitted ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create forum"
          )}
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
