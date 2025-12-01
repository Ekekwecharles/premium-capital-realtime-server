import express from "express";
import http from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import dotenv from "dotenv";

import User from "./models/User";

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI!, {
    dbName: process.env.DB_NAME || "test",
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

// Map userId → socketId
const clients = new Map<string, string>();

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("register-user", (userId: string) => {
    clients.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  socket.on("disconnect", () => {
    for (const [userId, sockId] of clients.entries()) {
      if (sockId === socket.id) {
        clients.delete(userId);
        break;
      }
    }
  });
});

// WATCH USER DOCUMENTS FOR CHANGES
const changeStream = User.watch([], { fullDocument: "updateLookup" });

changeStream.on("change", (change) => {
  const updatedUser = change.fullDocument;
  const userId = updatedUser._id.toString();

  console.log("User changed:", userId);

  const socketId = clients.get(userId);
  if (socketId) {
    io.to(socketId).emit("user-updated", updatedUser);
  }
});

server.listen(5000, () => console.log("Realtime server on port 5000"));
