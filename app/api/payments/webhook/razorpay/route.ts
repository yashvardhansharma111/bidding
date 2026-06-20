import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import User from "@/lib/db/models/User";
import WalletTransaction from "@/lib/db/models/WalletTransaction";
import { verifyWebhookSignature } from "@/lib/payment/razorpay";

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-razorpay-signature") || "";
    const rawBody = await req.text();

    if (!verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "payment.captured") {
      const notes = event.payload?.payment?.entity?.notes;
      const receipt = event.payload?.order?.entity?.receipt || "";

      if (receipt.startsWith("reg_")) {
        const userId = receipt.replace("reg_", "");
        await connectDB();
        const user = await User.findById(userId);

        if (user && !user.isVerified) {
          user.isVerified = true;
          user.walletBalance = 500;
          await user.save();

          await WalletTransaction.create({
            user: user._id,
            type: "registration_credit",
            amount: 500,
            balanceAfter: 500,
            description: "Registration fee refunded as wallet credit (webhook)",
            ref: event.payload?.payment?.entity?.id,
          });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[razorpay webhook]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
