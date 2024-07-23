"use client";
import { saveRequiredUserFields } from "@/server/db/actions/user";
import { useEffect, useRef, useState } from "react";
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
import { useDebounce, useDebouncedCallback } from "use-debounce";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import { ApiResponse } from "@/server/apiResponse";
import { env } from "@/env/client.mjs";
import { LoadingButton } from "@/components/ui/loadingButton";
import { toast } from "sonner";
import { trpc } from "@/app/_trpc/client";
import clsx from "clsx";
import { LoaderCircle } from "lucide-react";
import { useEffectUpdate } from "@/lib/utils.client";

const formSchema = z.object({
  username: z
    .string()
    .min(3, {
      message: "Username should have atleast 3 characters",
    })
    .max(24, {
      message: "Username must be less than 24 characters",
    })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username must only contain letters, numbers, and underscores",
    }),
  name: z
    .string()
    .min(1, {
      message: "Full name is required",
    })
    .max(64, {
      message: "Full name must be less than 64 characters",
    })
    .regex(/^[a-zA-Z ]+$/, {
      message: "Full name must only contain letters and spaces",
    }),
});

function OnBoardingForm({
  username,
  name,
}: {
  username?: string;
  name?: string;
}) {
  const initialUsername = useRef(username);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: username ?? "",
      name: name ?? "",
    },
  });

  const usernameWatch = form.watch("username");

  const [usernameChange] = useDebounce(usernameWatch, 200);
  const isValidUsername =
    !!usernameChange.trim() && usernameChange.trim().length > 2;

  const {
    status,
    data: usernameAvailable,
    isPaused,
    refetch,
  } = trpc.nameAvailability.useQuery(
    {
      name: usernameChange,
      type: "username",
    },
    {
      enabled: false,
    }
  );

  useEffectUpdate(() => {
    isValidUsername && refetch();
  }, [usernameChange]);
  const setUser = useUserStore((v) => v.setUser);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const router = useRouter();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (status == "pending" || status == "error" || !usernameAvailable) {
      return;
    }
    setHasSubmitted(true);
    const res = await saveRequiredUserFields(values);
    if (res.error) {
      toast.error("An error has occurred", {
        description: res.message,
      });
      return;
    }
    setUser(res.data ?? null);
    router.push("/feed");
  }

  function UsernameStatus() {
    if (!isValidUsername || initialUsername.current === usernameChange) {
      return null;
    }
    if (status == "success") {
      return (
        <p
          className={clsx({
            "text-green-500": usernameAvailable,
            "text-destructive": !usernameAvailable,
          })}
        >
          Username is {usernameAvailable ? "available" : "already taken."}
        </p>
      );
    }
    if (status == "pending") {
      return (
        <span className="flex items-center">
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Checking
          username...
        </span>
      );
    }

    return null;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4 my-2 justify-between h-full flex-grow"
      >
        <FormField
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="MyUsername" {...field} />
              </FormControl>
              <FormMessage />
              <UsernameStatus />
            </FormItem>
          )}
        />
        <FormField
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="My Name " {...field} />
              </FormControl>
              <FormDescription>
                This will be displayed on your profile
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <LoadingButton
          type="submit"
          isLoading={hasSubmitted}
          loadingText="Submiting..."
        >
          Submit
        </LoadingButton>
      </form>
    </Form>
  );
}

export default OnBoardingForm;
