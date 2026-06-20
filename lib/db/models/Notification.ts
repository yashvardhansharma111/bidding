import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotificationDoc extends Document {
  user: mongoose.Types.ObjectId;
  type: "outbid" | "won" | "auction_start" | "auction_end" | "payment" | "system";
  title: string;
  message: string;
  isRead: boolean;
  data?: Record<string, unknown>;
}

const NotificationSchema = new Schema<INotificationDoc>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["outbid", "won", "auction_start", "auction_end", "payment", "system"], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    data: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

NotificationSchema.index({ user: 1, isRead: 1 });
NotificationSchema.index({ createdAt: -1 });

const Notification: Model<INotificationDoc> =
  mongoose.models.Notification || mongoose.model<INotificationDoc>("Notification", NotificationSchema);
export default Notification;
