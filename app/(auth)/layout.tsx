import Link from "next/link";
import { Gavel } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2874F0] to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-white">
            <Gavel size={32} className="text-[#FFE500]" />
            <span className="text-3xl font-bold">CashBid</span>
          </Link>
          <p className="text-blue-200 mt-1 text-sm">India's Hidden Mobile Auction Platform</p>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-8">{children}</div>
      </div>
    </div>
  );
}
