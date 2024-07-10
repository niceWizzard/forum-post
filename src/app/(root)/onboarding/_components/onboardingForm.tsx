"use client";
import { saveRequiredUserFields } from "@/server/db/actions/user";
import { useState } from "react";
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
import { useDebouncedCallback } from "use-debounce";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import { ApiResponse } from "@/server/apiResponse";
import { env } from "@/env/client.mjs";
import { useEffectUpdate } from "@/lib/utils";
import { LoadingButton } from "@/components/ui/loadingButton";

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

function OnBoardingForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      name: "",
    },
  });

  const {
    data: usernameAvailable,
    fetching,
    finish,
    state,
    reset,
  } = useUsernameCheckStatus();

  const setUser = useUserStore((v) => v.setUser);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const router = useRouter();

  const usernameChange = form.watch("username");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (
      state == Status.Loading ||
      (state == Status.Finished && !usernameAvailable)
    ) {
      return;
    }
    setHasSubmitted(true);
    const res = await saveRequiredUserFields(values);
    if (!res.error) {
      setUser(res.data ?? null);
    }
    router.push("/feed");
  }

  const usernameCheck = useDebouncedCallback(async (username: string) => {
    if (!(await form.trigger("username"))) {
      reset();
      return;
    }
    fetching();
    const url = new URL(
      "api/name-availability?type=username",
      env.PUBLIC_BASE_URL
    );
    url.searchParams.append("name", username);
    const a: ApiResponse<boolean> = await (await fetch(url)).json();
    if (a.error) {
      reset();
    } else {
      finish(a.data ?? false);
    }
  }, 300);

  useEffectUpdate(() => {
    usernameCheck(usernameChange);
  }, [usernameChange]);

  function UsernameStatus() {
    if (state == Status.Finished) {
      return (
        <p>Username is {usernameAvailable ? "available" : "already taken."}</p>
      );
    }
    if (state == Status.Loading) {
      return <p>Checking username...</p>;
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

enum Status {
  Unset,
  Loading,
  Finished,
}
function useUsernameCheckStatus() {
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
