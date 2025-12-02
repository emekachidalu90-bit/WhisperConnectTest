import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import path from "path";
import express from "express";
import { log } from "./index";

// Password for authentication
const CORRECT_PASSWORD = "BoysOnly";

// In-memory user storage
interface ConnectedUser {
  username: string;
  socketId: string;
}

const connectedUsers: Map<string, ConnectedUser> = new Map();

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Serve static files from public folder for vanilla HTML/CSS/JS
  app.use(express.static(path.resolve(process.cwd(), "public")));

  // Initialize Socket.io
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Get list of online usernames
  function getOnlineUsers(): string[] {
    return Array.from(connectedUsers.values()).map(user => user.username);
  }

  // Find user by username (case-insensitive)
  function findUserByUsername(username: string): ConnectedUser | undefined {
    for (const user of connectedUsers.values()) {
      if (user.username.toLowerCase() === username.toLowerCase()) {
        return user;
      }
    }
    return undefined;
  }

  // Socket.io connection handling
  io.on("connection", (socket) => {
    log(`New connection: ${socket.id}`, "socket.io");

    // Handle login
    socket.on("login", (data: { username: string; password: string }) => {
      const { username, password } = data;

      // Validate password
      if (password !== CORRECT_PASSWORD) {
        socket.emit("login-error", { message: "Incorrect password. Try again!" });
        return;
      }

      // Validate username
      const trimmedUsername = username.trim();
      if (!trimmedUsername || trimmedUsername.length < 2 || trimmedUsername.length > 20) {
        socket.emit("login-error", { message: "Username must be 2-20 characters" });
        return;
      }

      // Check if username is already taken
      const existingUser = findUserByUsername(trimmedUsername);
      if (existingUser) {
        socket.emit("login-error", { message: "Username is already taken" });
        return;
      }

      // Create user
      const user: ConnectedUser = {
        username: trimmedUsername,
        socketId: socket.id
      };
      connectedUsers.set(socket.id, user);

      log(`User joined: ${trimmedUsername}`, "socket.io");

      // Send success to the user
      socket.emit("login-success", { username: trimmedUsername });

      // Broadcast user joined to all other users
      socket.broadcast.emit("user-joined", { username: trimmedUsername });

      // Send updated user list to everyone
      io.emit("user-list", getOnlineUsers());
    });

    // Handle public message
    socket.on("public-message", (data: { message: string }) => {
      const user = connectedUsers.get(socket.id);
      if (!user) return;

      const message = data.message.trim();
      if (!message || message.length > 1000) return;

      log(`Message from ${user.username}: ${message}`, "socket.io");

      // Broadcast to all users including sender
      io.emit("public-message", {
        username: user.username,
        message: message
      });
    });

    // Handle whisper
    socket.on("whisper", (data: { to: string; message: string }) => {
      const sender = connectedUsers.get(socket.id);
      if (!sender) return;

      const message = data.message.trim();
      const targetUsername = data.to.trim();

      if (!message || message.length > 1000) return;
      if (!targetUsername) return;

      // Find target user
      const targetUser = findUserByUsername(targetUsername);
      if (!targetUser) {
        socket.emit("whisper-error", { message: `User "${targetUsername}" is not online` });
        return;
      }

      if (targetUser.socketId === socket.id) {
        socket.emit("whisper-error", { message: "You can't whisper to yourself!" });
        return;
      }

      log(`Whisper from ${sender.username} to ${targetUser.username}: ${message}`, "socket.io");

      // Send to target
      io.to(targetUser.socketId).emit("whisper", {
        from: sender.username,
        to: targetUser.username,
        message: message
      });

      // Confirm to sender
      socket.emit("whisper-sent", {
        to: targetUser.username,
        message: message
      });
    });

    // Handle logout
    socket.on("logout", () => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        log(`User logged out: ${user.username}`, "socket.io");
        connectedUsers.delete(socket.id);
        socket.broadcast.emit("user-left", { username: user.username });
        io.emit("user-list", getOnlineUsers());
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        log(`User disconnected: ${user.username}`, "socket.io");
        connectedUsers.delete(socket.id);
        socket.broadcast.emit("user-left", { username: user.username });
        io.emit("user-list", getOnlineUsers());
      }
    });
  });

  return httpServer;
}
