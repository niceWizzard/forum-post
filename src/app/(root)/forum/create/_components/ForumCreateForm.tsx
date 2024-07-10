"use client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { env } from "@/env/client.mjs";
import { cn, useEffectUpdate } from "@/lib/utils";
import { ApiResponse } from "@/server/apiResponse";
import { createForum } from "@/server/db/actions/forum";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useDebouncedCallback } from "use-debounce";
import { z } from "zod";
import { useState } from "react";
import { LoadingButton } from "@/components/ui/loadingButton";
import { forumCreateSchema } from "@/server/db/actions/schema";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const formSchema = forumCreateSchema;

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
    if (res.error) {
      toast.error("An error has occurred", {
        description: res.message,
      });
    } else if (res.data) {
      router.push(`/forum/${res.data.forumId}`);
    }
  }

  const usernameChange = form.watch("name");

  useEffectUpdate(() => {
    (async () => await forumNameCheck(usernameChange))();
  }, [usernameChange]);

  const forumNameCheck = useDebouncedCallback(async (forumName: string) => {
    if (!(await form.trigger("name"))) {
      reset();
      return;
    }
    fetching();
    const url = new URL("api/name-availability", env.PUBLIC_BASE_URL);
    url.searchParams.append("type", "forum");
    url.searchParams.append("name", forumName);
    const a: ApiResponse<boolean> = await (await fetch(url)).json();
    if (a.error) {
      reset();
      toast.error("An error has occurred", {
        description: a.message,
      });
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
              "text-destructive": !forumNameAvailable,
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
        className="flex flex-col gap-4 min-h-[70vh]"
      >
        <FormField
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Forum name</FormLabel>
              <FormControl>
                <Input placeholder="Form name" {...field} />
              </FormControl>
              <ForumNameAvailability />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="description"
          render={({ field }) => (
            <FormItem className="flex-grow flex flex-col">
              <FormLabel>Forum Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descibe what the forum is for..."
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
