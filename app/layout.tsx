import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "CashBid — Bid. Win. Own.", template: "%s | CashBid" },
  description: "India's premier mobile phone auction platform. Bid on new, refurbished, and bulk devices.",
  keywords: ["mobile auction", "phone bidding", "refurbished phones", "bulk phones", "CashBid"],
  openGraph: {
    title: "CashBid — Mobile Phone Auctions",
    description: "Bid on premium mobile phones at unbeatable prices",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${inter.className}`}>
      <body className="min-h-full flex flex-col bg-gray-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
