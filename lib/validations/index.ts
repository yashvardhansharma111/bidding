import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/, "Need uppercase").regex(/[0-9]/, "Need number"),
  phone: z.string().optional(),
  referralCode: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const auctionSchema = z.object({
  title: z.string().min(3).max(200),
  brand: z.string().min(1),
  model: z.string().min(1),
  condition: z.enum(["new", "open_box", "refurbished", "used"]),
  imei: z.string().optional(),
  batchId: z.string().optional(),
  specs: z.object({
    ram: z.string().optional(),
    storage: z.string().optional(),
    processor: z.string().optional(),
    battery: z.string().optional(),
    display: z.string().optional(),
    camera: z.string().optional(),
    os: z.string().optional(),
    color: z.string().optional(),
  }).optional(),
  description: z.string().min(10),
  images: z.array(z.string().url()).min(1),
  category: z.enum(["individual", "bulk"]),
  quantity: z.number().int().min(1),
  bulkWinnerType: z.enum(["winner_takes_all", "top_n_bidders"]).optional(),
  topNWinners: z.number().int().min(1).optional(),
  baseBidPrice: z.number().min(1),
  minIncrement: z.number().min(1),
  buyNowPrice: z.number().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  sellerSource: z.enum(["flipkart_liquidation", "warehouse", "dealer", "customer_resale"]),
  deliveryCharges: z.number().min(0).default(0),
});

export const bidSchema = z.object({
  amount: z.number().min(1),
  isAutoBid: z.boolean().default(false),
  maxAutoBid: z.number().optional(),
});

export const paymentSchema = z.object({
  method: z.enum(["upi", "card", "netbanking"]),
  orderId: z.string(),
});
