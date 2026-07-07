import Auction from "./models/Auction";

export async function syncAuctionStatuses() {
  const now = new Date();
  await Promise.all([
    // normal auctions: upcoming → live when startTime passes
    Auction.updateMany(
      { status: "upcoming", startTime: { $lte: now }, condition: { $ne: "refurbished" }, category: { $ne: "bulk" } },
      { $set: { status: "live" } }
    ),
    // refurbished/bulk: always force to live (no timer — admin deletes when stock runs out)
    Auction.updateMany(
      { status: "upcoming", $or: [{ condition: "refurbished" }, { category: "bulk" }] },
      { $set: { status: "live" } }
    ),
    // normal auctions only: live → ended when endTime passes
    Auction.updateMany(
      {
        status: "live",
        endTime: { $lte: now },
        condition: { $ne: "refurbished" },
        category: { $ne: "bulk" },
      },
      { $set: { status: "ended" } }
    ),
  ]);
}
