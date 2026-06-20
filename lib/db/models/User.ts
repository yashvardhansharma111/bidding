import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUserDoc extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: "user" | "admin";
  avatar?: string;
  isBanned: boolean;
  isVerified: boolean;
  walletBalance: number;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDoc>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    phone: { type: String, trim: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    avatar: { type: String },
    isBanned: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    walletBalance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

UserSchema.index({ role: 1 });

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

const User: Model<IUserDoc> = mongoose.models.User || mongoose.model<IUserDoc>("User", UserSchema);
export default User;
