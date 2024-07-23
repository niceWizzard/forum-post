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
import { cn } from "@/lib/utils";
import { createForum } from "@/server/db/actions/forum";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useDebounce } from "use-debounce";
import { z } from "zod";
import { useState } from "react";
import { LoadingButton } from "@/components/ui/loadingButton";
import { forumCreateSchema } from "@/server/db/actions/schema";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { trpc } from "@/app/_trpc/client";
import { useEffectUpdate } from "@/lib/utils.client";

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

  const router = useRouter();

  const usernameWatch = form.watch("name");

  const [usernameChange] = useDebounce(usernameWatch, 200);
  const isValidUsername =
    !!usernameChange.trim() && usernameChange.trim().length > 2;
  const {
    status,
    data: forumNameAvailable,
    isPaused,
    refetch,
  } = trpc.nameAvailability.useQuery(
    {
      name: usernameChange,
      type: "forum",
    },
    {
      enabled: false,
    }
  );

  useEffectUpdate(() => {
    isValidUsername && refetch();
  }, [usernameChange]);

  async function onSubmit(values: ForumSchema) {
    if (
      status == "pending" ||
      status == "error" ||
      !forumNameAvailable ||
      hasSubmitted ||
      !(await form.trigger("name"))
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

  function ForumNameAvailability() {
    if (!isValidUsername) {
      return null;
    }
    if (status == "success") {
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
    if (status == "pending") {
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
