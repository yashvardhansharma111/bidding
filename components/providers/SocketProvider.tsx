"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { getSocket } from "@/lib/socket/client";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const socket = getSocket();
    if (!socket.connected) socket.connect();

    socket.on("connect", () => {
      socket.emit("user_register", { userId: user._id });
      socket.emit("user_join", user._id);
    });

    return () => {
      socket.off("connect");
    };
  }, [isAuthenticated, user]);

  return <>{children}</>;
}
