"use client";

import { saveRequiredUserFields } from "@/server/db/actions/user";
import { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebouncedCallback } from "use-debounce";
import { useFormState } from "react-dom";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ApiResponse } from "@/server/apiResponse";

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
      console.log("SETTING USER");
      setUser(res.user ?? null);
    }
    router.push("/feed");
  }

  const usernameCheck = useDebouncedCallback(async (username: string) => {
    if (!username.trim() || username.length < 3) {
      reset();
      return;
    }
    fetching();
    const url = new URL(
      "api/name-availability?type=username",
      "http://localhost:3000"
    );
    url.searchParams.append("name", username);
    const a: ApiResponse<boolean> = await (await fetch(url)).json();
    if (a.error) {
      reset();
    } else {
      finish(a.data ?? false);
    }
  }, 300);

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
                <Input
                  placeholder="MyUsername"
                  {...field}
                  onChangeCapture={async (e) =>
                    await usernameCheck(e.currentTarget.value)
                  }
                />
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
        <Button type="submit" disabled={hasSubmitted}>
          {hasSubmitted ? (
            <>
              <Loader2 />
              Submitting...
            </>
          ) : (
            <span>Submit</span>
          )}
        </Button>
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
