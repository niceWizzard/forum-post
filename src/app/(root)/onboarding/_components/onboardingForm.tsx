"use client";

import { saveRequiredUserFields } from "@/server/db/actions/user";
import { useRef } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  username: z
    .string()
    .min(1, {
      message: "Username is required",
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

  function onSubmit(values: z.infer<typeof formSchema>) {
    saveRequiredUserFields(values);
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
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}

export default OnBoardingForm;
