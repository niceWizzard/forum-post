import "client-only";
import { User } from "lucia";
import { create } from "zustand";

interface UserStore {
  user: User | null;
  isLoading: boolean;
  setUser: (v: User | null) => void;
  clearUser: () => void;
  setLoaded: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isLoading: true,
  setLoaded: () => set({ isLoading: false }),
  setUser: (v) => set({ user: v }),
  clearUser: () => set({ user: null }),
}));
