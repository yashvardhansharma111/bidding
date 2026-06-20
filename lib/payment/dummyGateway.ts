import type { IPaymentGateway, PaymentRequest, PaymentResult } from "./paymentService";

const simulateDelay = () => new Promise((r) => setTimeout(r, 1500));

export const dummyGateway: IPaymentGateway = {
  async processPayment(req: PaymentRequest): Promise<PaymentResult> {
    await simulateDelay();

    // Simulate 90% success rate
    const isSuccess = Math.random() > 0.1;

    if (isSuccess) {
      return {
        success: true,
        transactionId: `TXN_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      };
    } else {
      return {
        success: false,
        failureReason: "Payment declined by bank. Please try again.",
      };
    }
  },

  async refundPayment(_transactionId: string, _amount: number): Promise<boolean> {
    await simulateDelay();
    return true;
  },
};
