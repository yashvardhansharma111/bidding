import type { IPaymentDoc } from "../db/models/Payment";
import { dummyGateway } from "./dummyGateway";

export interface PaymentRequest {
  amount: number;
  method: "upi" | "card" | "netbanking" | "razorpay";
  orderId: string;
  userId: string;
  auctionId: string;
  metadata?: Record<string, string>;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  failureReason?: string;
  razorpayOrderId?: string;
}

export interface IPaymentGateway {
  processPayment(req: PaymentRequest): Promise<PaymentResult>;
  refundPayment(transactionId: string, amount: number): Promise<boolean>;
}

const gateway: IPaymentGateway = dummyGateway;
// Future: replace with razorpayGateway when keys are configured

export const paymentService = {
  async processPayment(req: PaymentRequest): Promise<PaymentResult> {
    return gateway.processPayment(req);
  },

  async refundPayment(transactionId: string, amount: number): Promise<boolean> {
    return gateway.refundPayment(transactionId, amount);
  },
};
