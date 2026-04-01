import { Server } from "socket.io";

let io: Server;

export function initSocket(server: any) {
  io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    console.log("Client connected");

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
}

export function getIO() {
  if (!io) throw new Error("Socket not initialized");
  return io;
}
