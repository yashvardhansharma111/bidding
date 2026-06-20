import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import User from "@/lib/db/models/User";
import { signToken } from "@/lib/auth/jwt";
import { setAuthCookie } from "@/lib/auth/cookies";
import { loginSchema } from "@/lib/validations";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Validation error", 422);

    await connectDB();
    const { email, password } = parsed.data;

    const user = await User.findOne({ email }).select("+password");
    if (!user) return apiError("Invalid email or password", 401);
    if (user.isBanned) return apiError("Account has been suspended", 403);

    const isValid = await user.comparePassword(password);
    if (!isValid) return apiError("Invalid email or password", 401);

    const token = signToken({ userId: user._id.toString(), email: user.email, role: user.role });
    await setAuthCookie(token);

    return apiSuccess({
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    }, "Login successful");
  } catch (err) {
    console.error("[login]", err);
    return apiError("Internal server error", 500);
  }
}
