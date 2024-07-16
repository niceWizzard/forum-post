"use client";

import { useUserStore } from "@/store/userStore";
import { User } from "lucia";
import { useEffect } from "react";

export default function UserStoreProvider(
  { initialState }: { initialState: User | null } = { initialState: null }
) {
  const { setUser, setLoaded } = useUserStore();
  useEffect(() => {
    setUser(initialState);
    setLoaded();
  }, []);
  return null;
}
