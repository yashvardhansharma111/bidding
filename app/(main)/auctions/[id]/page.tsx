import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { connectDB } from "@/lib/db/connect";
import AuctionModel from "@/lib/db/models/Auction";
import BidModel from "@/lib/db/models/Bid";
import "@/lib/db/models/User";
import { BiddingPanel } from "@/components/auctions/BiddingPanel";
import { BidHistory } from "@/components/auctions/BidHistory";
import { ImageGallery } from "@/components/auctions/ImageGallery";
import { Badge } from "@/components/shared/Badge";
import { getConditionLabel, getSellerSourceLabel } from "@/lib/utils/formatters";
import type { IAuction, IBid } from "@/types";
import { Package, Truck, Info, FileSpreadsheet, Star } from "lucide-react";
import { AuctionQuickActions } from "@/components/auctions/AuctionQuickActions";

interface Props {
  params: Promise<{ id: string }>;
}

async function getAuction(id: string): Promise<IAuction | null> {
  try {
    await connectDB();
    const doc = await AuctionModel.findById(id)
      .populate("winner", "name")
      .populate("createdBy", "name")
      .lean();
    if (!doc) return null;
    return JSON.parse(JSON.stringify(doc));
  } catch (err) {
    console.error("[getAuction] id:", id, err);
    return null;
  }
}

async function getInitialBids(auctionId: string): Promise<IBid[]> {
  try {
    await connectDB();
    const bids = await BidModel.find({ auction: auctionId })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("bidder", "name avatar")
      .lean();
    return JSON.parse(JSON.stringify(bids));
  } catch {
    return [];
  }
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
    { label: "Front Camera", value: auction.specs?.frontCamera },
    { label: "Back Camera", value: auction.specs?.backCamera || auction.specs?.camera },
    { label: "OS", value: auction.specs?.os },
    { label: "Color", value: auction.specs?.color },
    { label: "Warranty", value: auction.warranty },
  ].filter((r) => r.value);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 mb-4 flex items-center gap-1 overflow-hidden">
        <a href="/" className="hover:text-[#2874F0] shrink-0">Home</a>
        <span>/</span>
        <a href="/auctions" className="hover:text-[#2874F0] shrink-0">Auctions</a>
        <span>/</span>
        <span className="text-gray-600 truncate">{auction.title}</span>
      </nav>

      {/*
        Mobile layout order: images → title → bidding panel → specs → desc → seller → history
        Desktop layout: left col (images, title, specs, desc, seller, history) | right col sticky (bidding panel)
        Achieved by splitting left content into two divs and putting bidding panel between them.
        grid-rows allows bidding panel to span both row slots on desktop.
      */}
      <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8 gap-4">

        {/* Row 1 Left: Images + Title */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <ImageGallery images={auction.images} />
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant={auction.status as any}>{auction.status.toUpperCase()}</Badge>
              <Badge variant={auction.condition as any}>{getConditionLabel(auction.condition)}</Badge>
              {auction.category === "bulk" && (
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                  BULK — {auction.quantity} units
                </Badge>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{auction.title}</h1>
            <p className="text-gray-500">{auction.brand} {auction.model}</p>
          </div>
        </div>

        {/* Right column: Bidding panel — on mobile shows here (after title, before specs); on desktop sticky right */}
        <div className="lg:col-span-1 lg:row-span-2">
          <div className="lg:sticky lg:top-20">
            <BiddingPanel auction={auction} />
          </div>
        </div>

        {/* Row 2 Left: Specs + Description + Seller + History */}
        <div className="lg:col-span-2 space-y-4">
          {specRows.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5">
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

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5">
            <h2 className="font-bold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{auction.description}</p>
          </div>

          {auction.condition === "refurbished" && auction.customerReview && (
            <div className="bg-white rounded-xl border border-amber-100 shadow-sm p-4 sm:p-5">
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Star size={16} className="text-amber-500 fill-amber-500" /> Customer Review
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{auction.customerReview}</p>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            {auction.excelFile && (
              <div className="sm:col-span-2 border-t border-gray-100 pt-4">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FileSpreadsheet size={15} /> Bulk Lot Details
                </h3>
                <a
                  href={auction.excelFile}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                >
                  <FileSpreadsheet size={15} />
                  Download Item List (Excel/CSV)
                </a>
                <p className="text-xs text-gray-400 mt-1.5">Full list of items included in this bulk lot</p>
              </div>
            )}
          </div>

          {auction.condition !== "refurbished" && auction.category !== "bulk" && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5">
              <h2 className="font-bold text-gray-900 mb-4">Bid History</h2>
              <BidHistory bids={bids} />
            </div>
          )}
          {(auction.condition === "refurbished" || auction.category === "bulk") && (
            <AuctionQuickActions auction={auction} showBuyNow={false} />
          )}
        </div>

      </div>
    </div>
  );
}
