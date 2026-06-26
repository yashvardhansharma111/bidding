import Link from "next/link";
import { Suspense } from "react";
import { connectDB } from "@/lib/db/connect";
import Auction from "@/lib/db/models/Auction";
import { AuctionCard } from "@/components/auctions/AuctionCard";
import { SkeletonGrid } from "@/components/shared/SkeletonCard";
import { Zap, Clock, Package, ArrowRight, Shield, Award, CheckCircle, Truck, Smartphone, IndianRupee, MapPin, X, AlertCircle, Headphones, Video } from "lucide-react";
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
    <div className="max-w-7xl mx-auto px-3 sm:px-4">

      {/* Hero Banner */}
      <section className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#2874F0] text-white py-10 sm:py-16 px-4 sm:px-8 my-4 sm:my-6">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-6 right-32 w-72 h-72 rounded-full border-4 border-white" />
          <div className="absolute top-16 right-48 w-44 h-44 rounded-full border-4 border-white" />
          <div className="absolute -bottom-10 left-1/2 w-96 h-96 rounded-full border-2 border-white" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-[#FFE500] text-[#0f172a] text-xs font-bold px-3 py-1.5 rounded-full mb-5">
            <Zap size={12} />
            LAUNCH OFFER LIVE
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-3 tracking-tight">
            <span className="text-[#FFE500]">CASHBID</span>
          </h1>
          <p className="text-lg sm:text-2xl font-bold text-white/90 mb-2">
            India's Hidden Mobile Auction Platform
          </p>
          <p className="text-blue-200 text-lg mb-6">Bid More. Pay Less.</p>

          {/* Trust badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { icon: Smartphone,  label: "Verified Devices"       },
              { icon: Shield,      label: "IMEI Verified"          },
              { icon: CheckCircle, label: "10 Point Quality Check" },
              { icon: Truck,       label: "Pan India Delivery"     },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-lg px-3 py-2">
                <Icon size={16} className="text-[#FFE500] shrink-0" />
                <span className="text-xs font-semibold text-white/90">{label}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3 flex-wrap">
            <Link
              href="/auctions?status=live"
              className="bg-[#FFE500] text-[#0f172a] font-bold px-6 py-3 rounded-xl hover:bg-yellow-300 transition-colors shadow-lg"
            >
              Bid Live Now
            </Link>
            <Link
              href="/register"
              className="border-2 border-white/40 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors"
            >
              Join Free →
            </Link>
          </div>
        </div>
      </section>

      {/* Launch Offer Banner */}
      <div className="bg-gradient-to-r from-[#FFE500] to-yellow-400 rounded-2xl p-4 sm:p-6 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#2874F0] rounded-xl flex items-center justify-center shrink-0">
            <IndianRupee size={28} className="text-[#FFE500]" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#2874F0] uppercase tracking-wide mb-0.5">Launch Offer</p>
            <h3 className="text-xl sm:text-2xl font-black text-[#0f172a]">Add ₹500 Wallet & Start Bidding</h3>
            <p className="text-sm text-gray-700 mt-0.5">Top up your wallet and place bids instantly. Each bid costs just ₹100.</p>
          </div>
        </div>
        <Link
          href="/dashboard/wallet"
          className="bg-[#2874F0] text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors whitespace-nowrap shadow"
        >
          Add ₹500 Now
        </Link>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { step: "1", title: "Top Up Wallet", desc: "Add ₹100+ to your wallet via Razorpay", color: "bg-blue-50 border-blue-200" },
          { step: "2", title: "Place a Bid", desc: "Each bid costs ₹100 from your wallet", color: "bg-yellow-50 border-yellow-200" },
          { step: "3", title: "Win & Save", desc: "If you win, pay device price minus ₹100", color: "bg-green-50 border-green-200" },
        ].map(({ step, title, desc, color }) => (
          <div key={step} className={`rounded-xl border-2 p-5 ${color}`}>
            <div className="w-8 h-8 rounded-full bg-[#2874F0] text-white text-sm font-bold flex items-center justify-center mb-3">{step}</div>
            <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
            <p className="text-sm text-gray-500">{desc}</p>
          </div>
        ))}
      </div>

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
      <div className="grid grid-cols-2 gap-3 my-6">
        {[
          { href: "/auctions?condition=refurbished", label: "Refurbished", icon: Smartphone, bg: "bg-green-50",  iconBg: "bg-green-100",  iconColor: "text-green-600"  },
          { href: "/auctions?category=bulk",         label: "Bulk Lots",   icon: Package,   bg: "bg-orange-50", iconBg: "bg-orange-100", iconColor: "text-orange-500" },
        ].map(({ href, label, icon: Icon, bg, iconBg, iconColor }) => (
          <Link
            key={href}
            href={href}
            className={`${bg} rounded-2xl py-8 px-4 flex flex-col items-center justify-center gap-3 hover:shadow-md transition-shadow group`}
          >
            <div className={`w-16 h-16 rounded-2xl ${iconBg} flex items-center justify-center`}>
              <Icon size={32} className={iconColor} />
            </div>
            <p className="font-bold text-gray-700 text-base group-hover:text-[#2874F0] transition-colors">{label}</p>
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

      {/* Flipkart Liquidation CTA */}
      <div className="bg-[#FFE500] rounded-2xl p-5 sm:p-8 my-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-[#2874F0]">Flipkart Liquidation Stock</h3>
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

      {/* Why CashBid */}
      <section className="py-10 border-t border-gray-100 mt-8">
        {/* Heading */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-gray-900">Why CashBid?</h2>
          <p className="text-sm text-gray-500 mt-1">We make sure you get the best quality phones<br />with complete peace of mind.</p>
        </div>

        {/* Verified Devices */}
        <div className="bg-white rounded-2xl border-2 border-blue-100 p-5 mb-4 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
              <Smartphone size={24} className="text-[#2874F0]" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Verified Devices</h3>
              <p className="text-xs text-gray-500">Every phone passes our 10-point quality check before listing.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {[
              ["IMEI Verified", "Mic Tested"],
              ["Display Tested", "Charging Tested"],
              ["Touch Tested", "Battery Checked"],
              ["Camera Tested", "Network Tested"],
              ["Speaker Tested", "Buttons Tested"],
            ].map(([left, right]) => (
              <div key={left} className="contents">
                <div className="flex items-center gap-1.5 text-xs text-gray-700">
                  <CheckCircle size={13} className="text-green-500 shrink-0" />{left}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-700">
                  <CheckCircle size={13} className="text-green-500 shrink-0" />{right}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 100% Quality Assured */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
            <Shield size={24} className="text-[#2874F0]" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">100% Quality Assured</h3>
            <p className="text-xs text-gray-500">Only genuine &amp; working devices are listed.</p>
          </div>
        </div>

        {/* Pan India Delivery */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 shadow-sm">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
              <Truck size={24} className="text-[#2874F0]" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Pan India Delivery</h3>
              <p className="text-xs text-gray-500">Shipped to any pincode across India with full tracking and insurance.</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: MapPin,  label: "Pincode Serviceable" },
              { icon: Package, label: "Secure Packaging"    },
              { icon: Shield,  label: "Insured Delivery"    },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 bg-gray-50 rounded-xl p-3 text-center">
                <Icon size={18} className="text-[#2874F0]" />
                <span className="text-[10px] text-gray-600 font-medium leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Warranty Protection */}
        <div className="mb-6">
          <div className="text-center mb-4">
            <h3 className="text-lg font-black text-gray-900">Warranty Protection</h3>
            <p className="text-xs text-gray-500">Buy with confidence on CashBid</p>
          </div>

          {/* 3 warranty columns */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {/* Auction Devices */}
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
              <p className="text-[11px] font-bold text-gray-800 text-center mb-2">Auction Devices</p>
              <div className="bg-[#2874F0] text-white text-[9px] font-bold rounded-full px-2 py-1 text-center mb-2 leading-tight">9-Day Check Warranty</div>
              <p className="text-[9px] text-gray-500 font-semibold mb-1">Return accepted for:</p>
              {["Device Not Powering On", "Display Not Working", "Major Undisclosed Issues"].map((item) => (
                <div key={item} className="flex items-start gap-1 mb-0.5">
                  <CheckCircle size={9} className="text-green-500 shrink-0 mt-0.5" />
                  <span className="text-[9px] text-gray-600 leading-tight">{item}</span>
                </div>
              ))}
            </div>

            {/* Refurbished Devices */}
            <div className="bg-green-50 rounded-xl p-3 border border-green-100">
              <p className="text-[11px] font-bold text-gray-800 text-center mb-2">Refurbished Devices</p>
              <div className="bg-green-500 text-white text-[9px] font-bold rounded-full px-2 py-1 text-center mb-2 leading-tight">Delivery Warranty Only</div>
              {["Device Power On Guaranteed", "Display ON Guaranteed"].map((item) => (
                <div key={item} className="flex items-start gap-1 mb-0.5">
                  <CheckCircle size={9} className="text-green-500 shrink-0 mt-0.5" />
                  <span className="text-[9px] text-gray-600 leading-tight">{item}</span>
                </div>
              ))}
              <div className="flex items-center gap-1 mt-1">
                <X size={9} className="text-red-500 shrink-0" />
                <span className="text-[9px] text-red-500 font-semibold">No Further Warranty</span>
              </div>
            </div>

            {/* Bulk Lots */}
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
              <p className="text-[11px] font-bold text-gray-800 text-center mb-2">Bulk Lots</p>
              <div className="bg-gray-400 text-white text-[9px] font-bold rounded-full px-2 py-1 text-center mb-2 leading-tight">No Warranty</div>
              {["No Return", "No Refund", "No Warranty"].map((item) => (
                <div key={item} className="flex items-center gap-1 mb-0.5">
                  <span className="text-gray-400 text-[9px]">•</span>
                  <span className="text-[9px] text-gray-500">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 2-Day / Unboxing / Seal row */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { icon: Clock,   label: "2 Day Check Warranty"     },
              { icon: Video,   label: "Unboxing Video Required"   },
              { icon: Shield,  label: "Warranty Seal Required"    },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 p-3 flex flex-col items-center text-center gap-1.5 shadow-sm">
                <Icon size={18} className="text-[#2874F0]" />
                <span className="text-[10px] text-gray-600 font-medium leading-tight">{label}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-red-600 font-semibold">
            <AlertCircle size={13} />
            Seal Removed = Warranty Void
          </div>
        </div>

        {/* Why Choose CashBid? */}
        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-base font-black text-gray-900 text-center mb-5">Why Choose CashBid?</h3>
          <div className="grid grid-cols-5 gap-2">
            {[
              { icon: CheckCircle, label: "10 Point Quality Check",  color: "text-blue-500",   bg: "bg-blue-50"   },
              { icon: Shield,      label: "IMEI Verified Devices",   color: "text-green-500",  bg: "bg-green-50"  },
              { icon: Zap,         label: "Honest Bidding System",   color: "text-yellow-500", bg: "bg-yellow-50" },
              { icon: Package,     label: "Secure Packaging",        color: "text-orange-500", bg: "bg-orange-50" },
              { icon: Headphones,  label: "Dedicated Support",       color: "text-purple-500", bg: "bg-purple-50" },
            ].map(({ icon: Icon, label, color, bg }) => (
              <div key={label} className="flex flex-col items-center text-center gap-2">
                <div className={`w-12 h-12 rounded-full ${bg} flex items-center justify-center`}>
                  <Icon size={22} className={color} />
                </div>
                <span className="text-[10px] text-gray-600 font-medium leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
