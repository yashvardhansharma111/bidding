import { createServer } from "http";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { registerSocketHandlers } from "./lib/socket/handlers";

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  // Store io instance globally so API routes can emit events
  (global as any).io = io;

  registerSocketHandlers(io);

  httpServer.listen(port, () => {
    console.log(
      `> BidKart server ready on http://localhost:${port} [${dev ? "development" : "production"}]`
    );
  });
});
