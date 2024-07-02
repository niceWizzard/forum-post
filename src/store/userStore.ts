import { validateRequest } from "@/server/auth/action";
import "client-only";
import { User } from "lucia";
import { create } from "zustand";

interface UserStore {
  user: User | null;
  setUser: (v: User | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (v) => set({ user: v }),
  clearUser: () => set({ user: null }),
}));
