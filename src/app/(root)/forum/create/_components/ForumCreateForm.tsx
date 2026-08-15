"use client";

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
import { createForum } from "@/server/db/actions/forum";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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

  const nameWatch = form.watch("name");
  const [nameChange] = useDebounce(nameWatch, 250);
  const isValidName = !!nameChange.trim() && nameChange.trim().length > 2;

  const {
    status,
    data: forumNameAvailable,
    refetch,
  } = trpc.nameAvailability.useQuery(
    {
      name: nameChange,
      type: "forum",
    },
    {
      enabled: false,
    }
  );

  useEffectUpdate(() => {
    if (isValidName) {
      refetch();
    }
  }, [nameChange]);

  async function onSubmit(values: ForumSchema) {
    if (
      status === "pending" ||
      status === "error" ||
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
      toast.error("Could not create forum", {
        description: res.message,
      });
      setHasSubmitted(false);
    } else if (res.data) {
      toast.success("Community created successfully");
      router.push(`/forum/${res.data.forumId}`);
    }
  }

  function ForumNameAvailability() {
    if (!isValidName) {
      return null;
    }
    if (status === "success") {
      return (
        <p
          className={`text-xs mt-1 font-medium ${
            forumNameAvailable ? "text-emerald-500" : "text-destructive"
          }`}
        >
          {forumNameAvailable
            ? "Forum name is available"
            : "Forum name is already taken"}
        </p>
      );
    }
    if (status === "pending") {
      return (
        <span className="flex items-center text-xs text-muted-foreground mt-1">
          <Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> Checking availability...
        </span>
      );
    }
    return null;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Community Name</FormLabel>
              <FormControl>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs text-muted-foreground font-mono">
                    f/
                  </span>
                  <Input placeholder="technology" className="pl-7" {...field} />
                </div>
              </FormControl>
              <FormDescription className="text-xs">
                Names cannot contain spaces and must be unique.
              </FormDescription>
              <ForumNameAvailability />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the purpose and discussion topics of this community..."
                  className="min-h-[120px] resize-y"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-xs">
                A brief summary displayed on your community header and explore cards.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-2">
          <LoadingButton
            type="submit"
            isLoading={hasSubmitted}
            loadingText="Creating..."
            disabled={!forumNameAvailable && isValidName}
          >
            Create Community
          </LoadingButton>
        </div>
      </form>
    </Form>
  );
}

export default ForumCreateForm;
