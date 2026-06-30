"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

export function HomeHeroSecondaryCta() {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    // Placeholder keeps layout stable while auth check is in flight
    return (
      <span className="inline-block border-2 border-white/20 rounded-xl px-6 py-3 w-32 opacity-0 pointer-events-none" />
    );
  }

  const isLoggedIn = isAuthenticated && !!user;

  return (
    <Link
      href={isLoggedIn ? "/dashboard" : "/register"}
      className="border-2 border-white/40 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors"
    >
      {isLoggedIn ? "My Dashboard →" : "Join Free →"}
    </Link>
  );
}
