import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import WithdrawalRequest from "@/lib/db/models/WithdrawalRequest";
import User from "@/lib/db/models/User";
import WalletTransaction from "@/lib/db/models/WalletTransaction";
import Notification from "@/lib/db/models/Notification";
import { requireAdmin } from "@/lib/auth/getCurrentUser";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { z } from "zod";

const schema = z.object({
  action: z.enum(["approve", "reject"]),
  adminNote: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return apiError("Invalid action", 400);

    await connectDB();
    const withdrawal = await WithdrawalRequest.findById(id);
    if (!withdrawal) return apiError("Withdrawal request not found", 404);
    if (withdrawal.status !== "pending") return apiError("Request already processed", 400);

    const { action, adminNote } = parsed.data;

    if (action === "approve") {
      withdrawal.status = "approved";
      withdrawal.adminNote = adminNote;
      await withdrawal.save();

      await Notification.create({
        user: withdrawal.user,
        type: "payment",
        title: "Withdrawal Approved",
        message: `Your withdrawal of ₹${withdrawal.amount.toLocaleString("en-IN")} to ${withdrawal.upiId} has been approved and will be credited shortly.`,
        data: { withdrawalId: id },
      });
    } else {
      // Refund the held amount
      const dbUser = await User.findByIdAndUpdate(
        withdrawal.user,
        { $inc: { walletBalance: withdrawal.amount } },
        { new: true }
      ).select("walletBalance");

      withdrawal.status = "rejected";
      withdrawal.adminNote = adminNote;
      await withdrawal.save();

      await WalletTransaction.create({
        user: withdrawal.user,
        type: "admin_credit",
        amount: withdrawal.amount,
        balanceAfter: dbUser?.walletBalance ?? 0,
        description: `Withdrawal rejected — ₹${withdrawal.amount.toLocaleString("en-IN")} refunded`,
        ref: id,
      });

      await Notification.create({
        user: withdrawal.user,
        type: "payment",
        title: "Withdrawal Rejected",
        message: `Your withdrawal of ₹${withdrawal.amount.toLocaleString("en-IN")} was rejected${adminNote ? `: ${adminNote}` : ""}. Amount refunded to wallet.`,
        data: { withdrawalId: id },
      });
    }

    return apiSuccess({}, `Withdrawal ${action}d successfully`);
  } catch (err) {
    console.error("[admin withdrawal]", err);
    if ((err as Error).message === "Forbidden") return apiError("Forbidden", 403);
    return apiError("Internal server error", 500);
  }
}
