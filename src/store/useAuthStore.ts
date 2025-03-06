import { create } from "zustand";
import axios from "@/utils/axiosInstance";
import Cookies from "js-cookie";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "null") : null,
  token: Cookies.get("token") || null,

  login: async (email, password) => {
    try {
      const { data } = await axios.post("/auth/login", { email, password });
      Cookies.set("token", data.token, { expires: 1 });
      localStorage.setItem("user", JSON.stringify(data.user)); // Persist user in localStorage
      set({ user: data.user, token: data.token });
      return true;
    } catch (error: unknown) {
      console.error("Login error:", error);
      return false;
    }
  },

  logout: async () => {
    try {
      await axios.post("/auth/logout");
    } catch (error) {
      console.error("Logout API error:", error);
    }

    Cookies.remove("token");
    localStorage.removeItem("user"); // Clear user from storage
    set({ user: null, token: null });
    window.location.href = "/login"; // Redirect to login
  },
}));

export default useAuthStore;
