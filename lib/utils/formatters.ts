export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function getTimeRemaining(endTime: string | Date): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
} {
  const total = new Date(endTime).getTime() - Date.now();
  if (total <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  return {
    total,
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
  };
}

export function getAuctionStatusColor(status: string): string {
  const map: Record<string, string> = {
    live: "bg-green-100 text-green-800",
    upcoming: "bg-blue-100 text-blue-800",
    ended: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return map[status] ?? "bg-gray-100 text-gray-800";
}

export function getConditionLabel(condition: string): string {
  const map: Record<string, string> = {
    new: "New",
    open_box: "Open Box",
    refurbished: "Refurbished",
    used: "Used",
  };
  return map[condition] ?? condition;
}

export function getSellerSourceLabel(source: string): string {
  const map: Record<string, string> = {
    flipkart_liquidation: "Flipkart Liquidation",
    warehouse: "Warehouse Stock",
    dealer: "Dealer",
    customer_resale: "Customer Resale",
  };
  return map[source] ?? source;
}
