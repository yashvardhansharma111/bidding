import mongoose, { Schema, Document, Model } from "mongoose";

export type WalletTxType =
  | "registration_credit"
  | "topup"
  | "admin_credit"
  | "admin_debit"
  | "bid_hold"
  | "bid_refund"
  | "auction_won_debit"
  | "referral_bonus"
  | "withdrawal";

export interface IWalletTransactionDoc extends Document {
  user: mongoose.Types.ObjectId;
  type: WalletTxType;
  amount: number;
  balanceAfter: number;
  description: string;
  ref?: string;
}

const WalletTransactionSchema = new Schema<IWalletTransactionDoc>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["registration_credit", "topup", "admin_credit", "admin_debit", "bid_hold", "bid_refund", "auction_won_debit", "referral_bonus", "withdrawal"],
      required: true,
    },
    amount: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    description: { type: String, required: true },
    ref: { type: String },
  },
  { timestamps: true }
);

WalletTransactionSchema.index({ user: 1, createdAt: -1 });

const WalletTransaction: Model<IWalletTransactionDoc> =
  mongoose.models.WalletTransaction ||
  mongoose.model<IWalletTransactionDoc>("WalletTransaction", WalletTransactionSchema);

export default WalletTransaction;
