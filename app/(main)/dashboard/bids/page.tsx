import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/getCurrentUser";
import { connectDB } from "@/lib/db/connect";
import Bid from "@/lib/db/models/Bid";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { CountdownTimer } from "@/components/auctions/CountdownTimer";
import { Gavel, TrendingUp } from "lucide-react";

export default async function BidsPage() {
  const user = await requireAuth().catch(() => null);
  if (!user) redirect("/login");

  await connectDB();
  const bids = await Bid.find({ bidder: user._id })
    .sort({ createdAt: -1 })
    .populate({ path: "auction", select: "title images currentBid endTime status brand model" })
    .limit(20)
    .lean();

  return (
    <div className="max-w-4xl mx-auto px-0 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Bids</h1>
      {bids.length === 0 ? (
        <div className="text-center py-16">
          <Gavel size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No bids placed yet</p>
          <Link href="/auctions?status=live" className="inline-block mt-4 bg-[#2874F0] text-white px-5 py-2 rounded-lg font-semibold text-sm">
            Start Bidding
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bids.map((bid: any) => {
            const auction = bid.auction;
            if (!auction) return null;
            const isLeading = auction.currentBid === bid.amount;
            const isLive = auction.status === "live";
            return (
              <Link
                key={bid._id.toString()}
                href={`/auctions/${auction._id}`}
                className="block bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-3 items-center">
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-gray-50 border border-gray-100 shrink-0 overflow-hidden">
                    {auction.images?.[0] ? (
                      <Image
                        src={auction.images[0]}
                        alt={auction.title}
                        fill
                        sizes="64px"
                        className="object-contain p-1"
                      />
                    ) : (
                      <Gavel size={20} className="text-gray-300 absolute inset-0 m-auto" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 flex-1">{auction.title}</h3>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-[#2874F0] flex items-center gap-1">
                          <TrendingUp size={12} />
                          {formatCurrency(auction.currentBid)}
                        </p>
                        <p className="text-[10px] text-gray-400">current</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">{auction.brand} • {formatDate(bid.createdAt)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isLeading ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                        {isLeading ? "Leading" : "Outbid"}
                      </span>
                      <span className="text-xs text-gray-500">Your bid: {formatCurrency(bid.amount)}</span>
                      {isLive && <CountdownTimer endTime={auction.endTime} label="" />}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
