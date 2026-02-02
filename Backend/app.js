import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import eventRoutes from "./routes/eventRoutes.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || "*" },
});

app.use(cors());
app.use(express.json());

app.use("/api/events", eventRoutes(io));

io.on("connection", (socket) => {
  const userId = socket.handshake.query.user_id;
  if (userId) {
    socket.join(userId);
    console.log(`User ${userId} joined room.`);
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));
