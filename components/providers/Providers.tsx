"use client";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./AuthProvider";
import { SocketProvider } from "./SocketProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SocketProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#fff",
              color: "#171717",
              borderRadius: "8px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
              fontSize: "14px",
              fontWeight: 500,
            },
            success: { iconTheme: { primary: "#2874F0", secondary: "#fff" } },
            error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
          }}
        />
      </SocketProvider>
    </AuthProvider>
  );
}
