"use client";

import { saveRequiredUserFields } from "@/server/db/actions/user";
import { useRef } from "react";

function OnBoardingForm() {
  const usernameRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = {
          username: usernameRef.current?.value ?? "",
          name: nameRef.current?.value ?? "",
        };
        saveRequiredUserFields(data);
      }}
      className="text-black"
    >
      <input ref={usernameRef} type="text" placeholder="Username" />
      <input ref={nameRef} type="text" placeholder="Full name" />
      <button type="submit">Save</button>
    </form>
  );
}

export default OnBoardingForm;
