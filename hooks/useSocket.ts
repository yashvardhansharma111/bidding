"use client";
import { useEffect, useRef } from "react";
import { getSocket } from "@/lib/socket/client";
import type { Socket } from "socket.io-client";

export function useSocket() {
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;
    if (!socket.connected) socket.connect();
    return () => {};
  }, []);

  return socketRef.current || getSocket();
}
