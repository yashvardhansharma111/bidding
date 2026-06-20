import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBidDoc extends Document {
  auction: mongoose.Types.ObjectId;
  bidder: mongoose.Types.ObjectId;
  amount: number;
  isAutoBid: boolean;
  maxAutoBid?: number;
}

const BidSchema = new Schema<IBidDoc>(
  {
    auction: { type: Schema.Types.ObjectId, ref: "Auction", required: true },
    bidder: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 0 },
    isAutoBid: { type: Boolean, default: false },
    maxAutoBid: { type: Number },
  },
  { timestamps: true }
);

BidSchema.index({ auction: 1, createdAt: -1 });
BidSchema.index({ bidder: 1 });
BidSchema.index({ auction: 1, amount: -1 });

const Bid: Model<IBidDoc> = mongoose.models.Bid || mongoose.model<IBidDoc>("Bid", BidSchema);
export default Bid;
