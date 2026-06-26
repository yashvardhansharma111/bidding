import { createUploadthing, type FileRouter } from "uploadthing/next";
import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";

const f = createUploadthing();

const adminMiddleware = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("cashbid_token")?.value;
  if (!token) throw new Error("Unauthorized");
  const payload = verifyToken(token);
  if (payload.role !== "admin") throw new Error("Forbidden");
  return { userId: payload.userId };
};

export const ourFileRouter = {
  auctionImages: f({ image: { maxFileSize: "4MB", maxFileCount: 8 } })
    .middleware(adminMiddleware)
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.ufsUrl, uploadedBy: metadata.userId };
    }),
  bulkExcel: f({ blob: { maxFileSize: "8MB", maxFileCount: 1 } })
    .middleware(adminMiddleware)
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.ufsUrl, uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
