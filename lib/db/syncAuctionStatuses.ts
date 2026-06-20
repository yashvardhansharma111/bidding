import Auction from "./models/Auction";

export async function syncAuctionStatuses() {
  const now = new Date();
  await Promise.all([
    // upcoming → live
    Auction.updateMany(
      { status: "upcoming", startTime: { $lte: now } },
      { $set: { status: "live" } }
    ),
    // live → ended
    Auction.updateMany(
      { status: "live", endTime: { $lte: now } },
      { $set: { status: "ended" } }
    ),
  ]);
}
