import type { Server, Socket } from "socket.io";

interface JoinAuctionData {
  auctionId: string;
  userId?: string;
}

interface PlaceBidData {
  auctionId: string;
  userId: string;
  amount: number;
}

export function registerSocketHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    socket.on("auction_join", ({ auctionId }: JoinAuctionData) => {
      socket.join(`auction:${auctionId}`);
      socket.emit("auction_joined", { auctionId });
    });

    socket.on("auction_leave", ({ auctionId }: JoinAuctionData) => {
      socket.leave(`auction:${auctionId}`);
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
}

export function emitBidUpdate(io: Server, auctionId: string, payload: object) {
  io.to(`auction:${auctionId}`).emit("bid_update", payload);
}

export function emitAuctionEnd(io: Server, auctionId: string, payload: object) {
  io.to(`auction:${auctionId}`).emit("auction_end", payload);
}

export function emitOutbidNotification(io: Server, userId: string, payload: object) {
  io.to(`user:${userId}`).emit("outbid_notification", payload);
}
