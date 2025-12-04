import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "../types/api";
import { tokenStorage } from "../services/api";

interface AuthState {
  user?: User;
  token?: string;
  setCredentials: (payload: { user: User; token: string }) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: undefined,
      token: undefined,
      setCredentials: async ({ user, token }) => {
        await tokenStorage.set(token);
        set({ user, token });
      },
      logout: async () => {
        await tokenStorage.clear();
        set({ user: undefined, token: undefined });
      },
    }),
    {
      name: "travelmate_auth",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
    },
  ),
);
