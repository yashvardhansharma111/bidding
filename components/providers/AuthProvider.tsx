"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import axios from "axios";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    axios
      .get("/api/auth/me")
      .then(({ data }) => {
        const user = data.data.user;
        console.log("[AuthProvider] /api/auth/me response — role:", user?.role, "| email:", user?.email);
        setUser(user);
      })
      .catch((err) => {
        console.log("[AuthProvider] /api/auth/me failed:", err?.response?.status, err?.response?.data?.error);
        setUser(null);
      });
  }, [setUser, setLoading]);

  return <>{children}</>;
}
