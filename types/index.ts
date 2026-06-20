export type UserRole = "user" | "admin";
export type AuctionStatus = "upcoming" | "live" | "ended" | "cancelled";
export type AuctionCategory = "individual" | "bulk";
export type BulkWinnerType = "winner_takes_all" | "top_n_bidders";
export type PhoneCondition = "new" | "open_box" | "refurbished" | "used";
export type SellerSource = "flipkart_liquidation" | "warehouse" | "dealer" | "customer_resale";
export type PaymentStatus = "pending" | "processing" | "success" | "failed";
export type OrderStatus = "won" | "pending_payment" | "paid" | "shipped" | "delivered" | "cancelled";
export type NotificationType = "outbid" | "won" | "auction_start" | "auction_end" | "payment" | "system";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  isBanned: boolean;
  isVerified: boolean;
  walletBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface IPhoneSpecs {
  ram?: string;
  storage?: string;
  processor?: string;
  battery?: string;
  display?: string;
  camera?: string;
  os?: string;
  color?: string;
}

export interface IAuction {
  _id: string;
  title: string;
  brand: string;
  model: string;
  condition: PhoneCondition;
  imei?: string;
  batchId?: string;
  specs: IPhoneSpecs;
  description: string;
  images: string[];
  category: AuctionCategory;
  quantity: number;
  bulkWinnerType?: BulkWinnerType;
  topNWinners?: number;
  baseBidPrice: number;
  minIncrement: number;
  buyNowPrice?: number;
  currentBid: number;
  totalBidders: number;
  totalBids: number;
  startTime: string;
  endTime: string;
  status: AuctionStatus;
  winner?: string;
  sellerSource: SellerSource;
  deliveryCharges: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface IBid {
  _id: string;
  auction: string;
  bidder: string | IUser;
  amount: number;
  isAutoBid: boolean;
  maxAutoBid?: number;
  createdAt: string;
}

export interface IPayment {
  _id: string;
  order: string;
  user: string;
  auction: string;
  amount: number;
  method: "upi" | "card" | "netbanking" | "razorpay";
  status: PaymentStatus;
  transactionId?: string;
  razorpayOrderId?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IOrder {
  _id: string;
  auction: string | IAuction;
  winner: string | IUser;
  finalAmount: number;
  deliveryCharges: number;
  totalAmount: number;
  status: OrderStatus;
  payment?: string | IPayment;
  shippingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface INotification {
  _id: string;
  user: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
}

export interface IWatchlist {
  _id: string;
  user: string;
  auction: string | IAuction;
  createdAt: string;
}

export interface AuthState {
  user: IUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface BidUpdatePayload {
  auctionId: string;
  newBid: number;
  bidder: { _id: string; name: string };
  totalBids: number;
  totalBidders: number;
  timestamp: string;
}

export interface AuctionEndPayload {
  auctionId: string;
  winner: { _id: string; name: string } | null;
  finalBid: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuctionFilters {
  brand?: string;
  condition?: PhoneCondition;
  status?: AuctionStatus;
  minPrice?: number;
  maxPrice?: number;
  ram?: string;
  storage?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "endTime" | "currentBid" | "createdAt";
  sortOrder?: "asc" | "desc";
}
