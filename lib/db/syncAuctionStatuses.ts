import Auction from "./models/Auction";

export async function syncAuctionStatuses() {
  const now = new Date();
  await Promise.all([
    // upcoming → live
    Auction.updateMany(
      { status: "upcoming", startTime: { $lte: now } },
      { $set: { status: "live" } }
    ),
    // live → ended (never auto-end refurbished or bulk — admin deletes those manually)
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
