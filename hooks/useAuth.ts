"use client";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import axios from "axios";

export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, logout: storeLogout } = useAuthStore();
  const router = useRouter();

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const { data } = await axios.post("/api/auth/login", { email, password });
        setUser(data.data.user);
        toast.success("Welcome back!");
        router.push("/");
        return { success: true };
      } catch (err: any) {
        const msg = err.response?.data?.error || "Login failed";
        toast.error(msg);
        return { success: false, error: msg };
      }
    },
    [setUser, router]
  );

  const register = useCallback(
    async (name: string, email: string, password: string, phone?: string, referralCode?: string) => {
      try {
        const { data } = await axios.post("/api/auth/register", { name, email, password, phone, referralCode });
        setUser(data.data.user);
        toast.success("Account created!");
        router.push("/");
        return { success: true };
      } catch (err: any) {
        const msg = err.response?.data?.error || "Registration failed";
        toast.error(msg);
        return { success: false, error: msg };
      }
    },
    [setUser, router]
  );

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/auth/me");
      setUser(data.data.user);
    } catch { /* silent */ }
  }, [setUser]);

  const logout = useCallback(async () => {
    try {
      await axios.post("/api/auth/logout");
    } finally {
      storeLogout();
      router.push("/");
      toast.success("Logged out");
    }
  }, [storeLogout, router]);

  return { user, isAuthenticated, isLoading, login, register, logout, refreshUser };
}
