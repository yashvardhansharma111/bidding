import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAuctionDoc extends Omit<Document, "model"> {
  title: string;
  brand: string;
  model: string;
  condition: "new" | "open_box" | "refurbished" | "used";
  imei?: string;
  batchId?: string;
  specs: {
    ram?: string;
    storage?: string;
    processor?: string;
    battery?: string;
    display?: string;
    camera?: string;
    os?: string;
    color?: string;
  };
  description: string;
  images: string[];
  category: "individual" | "bulk";
  quantity: number;
  bulkWinnerType?: "winner_takes_all" | "top_n_bidders";
  topNWinners?: number;
  baseBidPrice: number;
  minIncrement: number;
  buyNowPrice?: number;
  warranty?: string;
  excelFile?: string;
  currentBid: number;
  totalBidders: number;
  totalBids: number;
  startTime: Date;
  endTime: Date;
  status: "upcoming" | "live" | "ended" | "cancelled";
  winner?: mongoose.Types.ObjectId;
  sellerSource: "flipkart_liquidation" | "warehouse" | "dealer" | "customer_resale";
  deliveryCharges: number;
  createdBy: mongoose.Types.ObjectId;
}

const SpecsSchema = new Schema(
  {
    ram: String,
    storage: String,
    processor: String,
    battery: String,
    display: String,
    camera: String,
    os: String,
    color: String,
  },
  { _id: false }
);

const AuctionSchema = new Schema<IAuctionDoc>(
  {
    title: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    condition: { type: String, enum: ["new", "open_box", "refurbished", "used"], required: true },
    imei: { type: String, trim: true },
    batchId: { type: String, trim: true },
    specs: { type: SpecsSchema, default: {} },
    description: { type: String, required: true },
    images: [{ type: String }],
    category: { type: String, enum: ["individual", "bulk"], required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    bulkWinnerType: { type: String, enum: ["winner_takes_all", "top_n_bidders"] },
    topNWinners: { type: Number, min: 1 },
    baseBidPrice: { type: Number, required: true, min: 0 },
    minIncrement: { type: Number, required: true, min: 1 },
    buyNowPrice: { type: Number },
  warranty: { type: String, trim: true },
    excelFile: { type: String, trim: true },
    currentBid: { type: Number, default: 0 },
    totalBidders: { type: Number, default: 0 },
    totalBids: { type: Number, default: 0 },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: String, enum: ["upcoming", "live", "ended", "cancelled"], default: "upcoming" },
    winner: { type: Schema.Types.ObjectId, ref: "User" },
    sellerSource: {
      type: String,
      enum: ["flipkart_liquidation", "warehouse", "dealer", "customer_resale"],
      required: true,
    },
    deliveryCharges: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

AuctionSchema.index({ status: 1, endTime: 1 });
AuctionSchema.index({ brand: 1 });
AuctionSchema.index({ category: 1 });
AuctionSchema.index({ currentBid: -1 });
AuctionSchema.index({ createdAt: -1 });

const Auction: Model<IAuctionDoc> =
  mongoose.models.Auction || mongoose.model<IAuctionDoc>("Auction", AuctionSchema);
export default Auction;
