import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWatchlistDoc extends Document {
  user: mongoose.Types.ObjectId;
  auction: mongoose.Types.ObjectId;
}

const WatchlistSchema = new Schema<IWatchlistDoc>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    auction: { type: Schema.Types.ObjectId, ref: "Auction", required: true },
  },
  { timestamps: true }
);

WatchlistSchema.index({ user: 1, auction: 1 }, { unique: true });

const Watchlist: Model<IWatchlistDoc> =
  mongoose.models.Watchlist || mongoose.model<IWatchlistDoc>("Watchlist", WatchlistSchema);
export default Watchlist;
