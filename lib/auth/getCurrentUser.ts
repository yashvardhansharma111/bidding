import { verifyToken } from "./jwt";
import { getAuthCookie } from "./cookies";
import { connectDB } from "../db/connect";
import User from "../db/models/User";
import type { IUser } from "@/types";

export async function getCurrentUser(): Promise<IUser | null> {
  try {
    const token = await getAuthCookie();
    if (!token) return null;
    const payload = verifyToken(token);
    await connectDB();
    const user = await User.findById(payload.userId).select("-password").lean();
    if (!user || user.isBanned) return null;
    return user as unknown as IUser;
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<IUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireAdmin(): Promise<IUser> {
  const user = await requireAuth();
  if (user.role !== "admin") throw new Error("Forbidden");
  return user;
}
