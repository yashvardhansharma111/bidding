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
      .then(({ data }) => setUser(data.data.user))
      .catch(() => setUser(null));
  }, [setUser, setLoading]);

  return <>{children}</>;
}
