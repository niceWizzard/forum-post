"use client";

import { useUserStore } from "@/store/userStore";
import { User } from "lucia";
import { useEffect } from "react";

export default function StoreProvider(
  { initialState }: { initialState: User | null } = { initialState: null }
) {
  const setUser = useUserStore((v) => v.setUser);
  useEffect(() => {
    setUser(initialState);
  }, []);
  return null;
}
