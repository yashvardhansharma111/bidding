import Link from "next/link";
import { Suspense } from "react";
import { connectDB } from "@/lib/db/connect";
import Auction from "@/lib/db/models/Auction";
import { AuctionCard } from "@/components/auctions/AuctionCard";
import { SkeletonGrid } from "@/components/shared/SkeletonCard";
import { Zap, Clock, Package, TrendingUp, ArrowRight, Shield, Award } from "lucide-react";
import type { IAuction } from "@/types";

async function getLiveAuctions(): Promise<IAuction[]> {
  await connectDB();
  const auctions = await Auction.find({ status: "live" })
    .sort({ endTime: 1 })
    .limit(8)
    .lean();
  return JSON.parse(JSON.stringify(auctions));
}

async function getUpcomingAuctions(): Promise<IAuction[]> {
  await connectDB();
  const auctions = await Auction.find({ status: "upcoming" })
    .sort({ startTime: 1 })
    .limit(4)
    .lean();
  return JSON.parse(JSON.stringify(auctions));
}

async function AuctionSection({ title, auctions, viewAllHref, icon: Icon, accent }: {
  title: string;
  auctions: IAuction[];
  viewAllHref: string;
  icon: any;
  accent?: string;
}) {
  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Icon size={22} className={accent || "text-[#2874F0]"} />
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        </div>
        <Link href={viewAllHref} className="flex items-center gap-1 text-[#2874F0] text-sm font-semibold hover:text-blue-700 transition-colors">
          View All <ArrowRight size={15} />
        </Link>
      </div>
      {auctions.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>No auctions available right now. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {auctions.map((auction) => (
            <AuctionCard key={auction._id} auction={auction} />
          ))}
        </div>
      )}
    </section>
  );
}

export default async function HomePage() {
  const [liveAuctions, upcomingAuctions] = await Promise.all([
    getLiveAuctions(),
    getUpcomingAuctions(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Hero Banner */}
      <section className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#2874F0] to-blue-800 text-white py-16 px-8 my-6">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-[#FFE500] text-[#2874F0] text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            <Zap size={12} />
            LIVE AUCTIONS NOW
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Bid on Premium<br />
            <span className="text-[#FFE500]">Mobile Phones</span><br />
            at Unbeatable Prices
          </h1>
          <p className="text-blue-200 mb-6 text-lg">
            New, refurbished, and bulk devices from verified sources. Every bid is a chance to win big.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link
              href="/auctions?status=live"
              className="bg-[#FFE500] text-[#2874F0] font-bold px-6 py-3 rounded-lg hover:bg-yellow-300 transition-colors"
            >
              Bid Live Now
            </Link>
            <Link
              href="/auctions?status=upcoming"
              className="border-2 border-white text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              View Upcoming
            </Link>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-white/5 border-4 border-white/10" />
        <div className="absolute right-20 top-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-white/5 border-4 border-white/10" />
      </section>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
        {[
          { icon: Zap, label: "Live Auctions", value: liveAuctions.length.toString(), color: "text-green-500" },
          { icon: Clock, label: "Upcoming", value: upcomingAuctions.length.toString(), color: "text-[#2874F0]" },
          { icon: Shield, label: "Verified Sources", value: "4", color: "text-orange-500" },
          { icon: Award, label: "Happy Winners", value: "1000+", color: "text-purple-500" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
            <Icon size={24} className={`${color} mx-auto mb-2`} />
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Category quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
        {[
          { href: "/auctions?brand=Apple", label: "iPhone", emoji: "🍎", bg: "bg-gray-50" },
          { href: "/auctions?brand=Samsung", label: "Samsung", emoji: "📱", bg: "bg-blue-50" },
          { href: "/auctions?condition=refurbished", label: "Refurbished", emoji: "♻️", bg: "bg-green-50" },
          { href: "/auctions?category=bulk", label: "Bulk Lots", emoji: "📦", bg: "bg-orange-50" },
        ].map(({ href, label, emoji, bg }) => (
          <Link key={href} href={href} className={`${bg} rounded-xl p-4 text-center hover:shadow-md transition-shadow group`}>
            <span className="text-3xl">{emoji}</span>
            <p className="font-semibold text-gray-700 mt-2 group-hover:text-[#2874F0] transition-colors">{label}</p>
          </Link>
        ))}
      </div>

      {/* Live Auctions */}
      <Suspense fallback={<SkeletonGrid count={8} />}>
        <AuctionSection
          title="Live Auctions"
          auctions={liveAuctions}
          viewAllHref="/auctions?status=live"
          icon={Zap}
          accent="text-green-500"
        />
      </Suspense>

      {/* CTA Banner */}
      <div className="bg-[#FFE500] rounded-2xl p-8 my-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-[#2874F0]">Flipkart Liquidation Stock</h3>
          <p className="text-gray-700 mt-1">Bulk lots of verified devices at wholesale prices</p>
        </div>
        <Link
          href="/auctions?sellerSource=flipkart_liquidation"
          className="bg-[#2874F0] text-white font-bold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <Package size={18} /> Shop Bulk Lots
        </Link>
      </div>

      {/* Upcoming */}
      <Suspense fallback={<SkeletonGrid count={4} />}>
        <AuctionSection
          title="Upcoming Auctions"
          auctions={upcomingAuctions}
          viewAllHref="/auctions?status=upcoming"
          icon={Clock}
        />
      </Suspense>

      {/* Features */}
      <section className="py-12 border-t border-gray-100 mt-8">
        <h2 className="text-xl font-bold text-center text-gray-900 mb-8">Why BidKart?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: Shield, title: "Verified Devices", desc: "Every phone is inspected and condition-graded before listing." },
            { icon: TrendingUp, title: "Real-time Bidding", desc: "Live socket-based bidding with instant updates and outbid alerts." },
            { icon: Award, title: "Secure Payments", desc: "Safe checkout with UPI, cards, and netbanking. Razorpay-ready." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icon size={24} className="text-[#2874F0]" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
