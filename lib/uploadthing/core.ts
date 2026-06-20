import { createUploadthing, type FileRouter } from "uploadthing/next";
import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";

const f = createUploadthing();

export const ourFileRouter = {
  auctionImages: f({ image: { maxFileSize: "4MB", maxFileCount: 8 } })
    .middleware(async () => {
      const cookieStore = await cookies();
      const token = cookieStore.get("bidkart_token")?.value;
      if (!token) throw new Error("Unauthorized");
      const payload = verifyToken(token);
      if (payload.role !== "admin") throw new Error("Forbidden");
      return { userId: payload.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.ufsUrl, uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
