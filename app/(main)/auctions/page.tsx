import { Suspense } from "react";
import { connectDB } from "@/lib/db/connect";
import Auction from "@/lib/db/models/Auction";
import { AuctionCard } from "@/components/auctions/AuctionCard";
import { SkeletonGrid } from "@/components/shared/SkeletonCard";
import { AuctionFiltersPanel } from "@/components/auctions/AuctionFiltersPanel";
import type { IAuction } from "@/types";

interface SearchParams {
  status?: string;
  brand?: string;
  condition?: string;
  category?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  ram?: string;
  storage?: string;
  page?: string;
  sortBy?: string;
}

async function getAuctions(sp: SearchParams): Promise<{ auctions: IAuction[]; total: number }> {
  await connectDB();
  const page = parseInt(sp.page || "1");
  const limit = 12;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (sp.status) filter.status = sp.status;
  if (sp.brand) filter.brand = { $regex: sp.brand, $options: "i" };
  if (sp.condition) filter.condition = sp.condition;
  if (sp.category) filter.category = sp.category;
  if (sp.ram) filter["specs.ram"] = sp.ram;
  if (sp.storage) filter["specs.storage"] = sp.storage;
  if (sp.minPrice || sp.maxPrice) {
    filter.currentBid = {};
    if (sp.minPrice) (filter.currentBid as Record<string, number>).$gte = parseFloat(sp.minPrice);
    if (sp.maxPrice) (filter.currentBid as Record<string, number>).$lte = parseFloat(sp.maxPrice);
  }
  if (sp.search) {
    filter.$or = [
      { title: { $regex: sp.search, $options: "i" } },
      { brand: { $regex: sp.search, $options: "i" } },
      { model: { $regex: sp.search, $options: "i" } },
    ];
  }

  const sortField = sp.sortBy === "price" ? "currentBid" : sp.sortBy === "endTime" ? "endTime" : "createdAt";
  const [auctions, total] = await Promise.all([
    Auction.find(filter).sort({ [sortField]: -1 }).skip(skip).limit(limit).lean(),
    Auction.countDocuments(filter),
  ]);

  return { auctions: JSON.parse(JSON.stringify(auctions)), total };
}

export default async function AuctionsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const { auctions, total } = await getAuctions(sp);

  const title = sp.search
    ? `Results for "${sp.search}"`
    : sp.status === "live"
    ? "Live Auctions"
    : sp.status === "upcoming"
    ? "Upcoming Auctions"
    : sp.category === "bulk"
    ? "Bulk Phone Lots"
    : "All Auctions";

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters sidebar */}
        <aside className="lg:w-64 shrink-0">
          <AuctionFiltersPanel />
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-500">{total} auctions found</p>
            </div>
          </div>

          <Suspense fallback={<SkeletonGrid count={12} />}>
            {auctions.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg font-medium">No auctions found</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {auctions.map((auction) => (
                  <AuctionCard key={auction._id} auction={auction} />
                ))}
              </div>
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
