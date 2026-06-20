import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { connectDB } from "@/lib/db/connect";
import AuctionModel from "@/lib/db/models/Auction";
import BidModel from "@/lib/db/models/Bid";
import { BiddingPanel } from "@/components/auctions/BiddingPanel";
import { BidHistory } from "@/components/auctions/BidHistory";
import { ImageGallery } from "@/components/auctions/ImageGallery";
import { Badge } from "@/components/shared/Badge";
import { formatCurrency, formatDate, getConditionLabel, getSellerSourceLabel } from "@/lib/utils/formatters";
import type { IAuction, IBid } from "@/types";
import { Package, Truck, Info } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

async function getAuction(id: string): Promise<IAuction | null> {
  await connectDB();
  try {
    const doc = await AuctionModel.findById(id)
      .populate("winner", "name")
      .populate("createdBy", "name")
      .lean();
    if (!doc) return null;
    return JSON.parse(JSON.stringify(doc));
  } catch {
    return null;
  }
}

async function getInitialBids(auctionId: string): Promise<IBid[]> {
  const bids = await BidModel.find({ auction: auctionId })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate("bidder", "name avatar")
    .lean();
  return JSON.parse(JSON.stringify(bids));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const auction = await getAuction(id);
  if (!auction) return { title: "Auction Not Found" };
  return {
    title: auction.title,
    description: auction.description.slice(0, 160),
  };
}

export default async function AuctionDetailPage({ params }: Props) {
  const { id } = await params;
  const [auction, bids] = await Promise.all([getAuction(id), getInitialBids(id)]);
  if (!auction) notFound();

  const specRows = [
    { label: "RAM", value: auction.specs?.ram },
    { label: "Storage", value: auction.specs?.storage },
    { label: "Processor", value: auction.specs?.processor },
    { label: "Battery", value: auction.specs?.battery },
    { label: "Display", value: auction.specs?.display },
    { label: "Camera", value: auction.specs?.camera },
    { label: "OS", value: auction.specs?.os },
    { label: "Color", value: auction.specs?.color },
  ].filter((r) => r.value);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 mb-4 flex items-center gap-1">
        <a href="/" className="hover:text-[#2874F0]">Home</a>
        <span>/</span>
        <a href="/auctions" className="hover:text-[#2874F0]">Auctions</a>
        <span>/</span>
        <span className="text-gray-600">{auction.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Images + Specs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <ImageGallery images={auction.images} />
          </div>

          {/* Title + badges */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant={auction.status as any}>{auction.status.toUpperCase()}</Badge>
              <Badge variant={auction.condition as any}>{getConditionLabel(auction.condition)}</Badge>
              {auction.category === "bulk" && (
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                  BULK — {auction.quantity} units
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{auction.title}</h1>
            <p className="text-gray-500">{auction.brand} {auction.model}</p>
            <p className="text-sm text-gray-400 mt-2">Listed: {formatDate(auction.createdAt)}</p>
          </div>

          {/* Specs */}
          {specRows.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Info size={16} className="text-[#2874F0]" /> Specifications
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {specRows.map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-500">{label}</span>
                    <span className="text-sm font-semibold text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{auction.description}</p>
          </div>

          {/* Seller + shipping */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><Package size={15} /> Seller Info</h3>
              <p className="text-sm text-gray-600">{getSellerSourceLabel(auction.sellerSource)}</p>
              {(auction.imei || auction.batchId) && (
                <p className="text-xs text-gray-400 mt-1">
                  {auction.imei ? `IMEI: ${auction.imei}` : `Batch: ${auction.batchId}`}
                </p>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><Truck size={15} /> Shipping</h3>
              <p className="text-sm text-gray-600">
                {auction.deliveryCharges === 0 ? "Free Delivery" : `₹${auction.deliveryCharges} delivery`}
              </p>
            </div>
          </div>

          {/* Bid history */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-4">Bid History</h2>
            <BidHistory bids={bids} />
          </div>
        </div>

        {/* Right: Bidding panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <BiddingPanel auction={auction} />
          </div>
        </div>
      </div>
    </div>
  );
}
