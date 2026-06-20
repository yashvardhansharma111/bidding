import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Auction from "@/lib/db/models/Auction";
import { requireAdmin } from "@/lib/auth/getCurrentUser";
import { auctionSchema } from "@/lib/validations";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { syncAuctionStatuses } from "@/lib/db/syncAuctionStatuses";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    await syncAuctionStatuses();
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    const status = searchParams.get("status");
    const brand = searchParams.get("brand");
    const condition = searchParams.get("condition");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const ram = searchParams.get("ram");
    const storage = searchParams.get("storage");

    if (status) filter.status = status;
    if (brand) filter.brand = { $regex: brand, $options: "i" };
    if (condition) filter.condition = condition;
    if (category) filter.category = category;
    if (ram) filter["specs.ram"] = ram;
    if (storage) filter["specs.storage"] = storage;
    if (minPrice || maxPrice) {
      filter.currentBid = {};
      if (minPrice) (filter.currentBid as Record<string, number>).$gte = parseFloat(minPrice);
      if (maxPrice) (filter.currentBid as Record<string, number>).$lte = parseFloat(maxPrice);
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { model: { $regex: search, $options: "i" } },
      ];
    }

    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    const [auctions, total] = await Promise.all([
      Auction.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Auction.countDocuments(filter),
    ]);

    return apiSuccess({
      data: auctions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("[GET /auctions]", err);
    return apiError("Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const parsed = auctionSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Validation error", 422);

    await connectDB();
    const now = new Date();
    const startTime = new Date(parsed.data.startTime);
    const status = startTime <= now ? "live" : "upcoming";

    const auction = await Auction.create({
      ...parsed.data,
      currentBid: parsed.data.baseBidPrice,
      status,
      createdBy: admin._id,
    });

    return apiSuccess({ auction }, "Auction created", 201);
  } catch (err) {
    console.error("[POST /auctions]", err);
    if ((err as Error).message === "Unauthorized") return apiError("Unauthorized", 401);
    if ((err as Error).message === "Forbidden") return apiError("Forbidden", 403);
    return apiError("Internal server error", 500);
  }
}
