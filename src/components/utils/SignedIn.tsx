"use client";

import { useUserStore } from "@/store/userStore";

export default function SignedIn({ children }: { children: React.ReactNode }) {
  const user = useUserStore((v) => v.user);
  if (!user) {
    return null;
  }
  return children;
}
