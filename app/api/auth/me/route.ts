import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError("Unauthorized", 401);
    return apiSuccess({ user });
  } catch (err) {
    console.error("[me]", err);
    return apiError("Internal server error", 500);
  }
}
