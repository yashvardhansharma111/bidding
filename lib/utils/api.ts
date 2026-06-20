import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";

export function apiSuccess<T>(data: T, message?: string, status = 200) {
  const body: ApiResponse<T> = { success: true, data, message };
  return NextResponse.json(body, { status });
}

export function apiError(error: string, status = 400) {
  const body: ApiResponse = { success: false, error };
  return NextResponse.json(body, { status });
}

export function handleApiError(err: unknown) {
  console.error("[API Error]", err);
  if (err instanceof Error) {
    if (err.message === "Unauthorized") return apiError("Unauthorized", 401);
    if (err.message === "Forbidden") return apiError("Forbidden", 403);
    return apiError(err.message);
  }
  return apiError("Internal server error", 500);
}
