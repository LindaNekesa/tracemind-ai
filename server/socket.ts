import { Server } from "socket.io";

let io: Server;

export function initSocket(server: any) {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
  });
}

export function sendNotification(message: string) {
  if (io) {
    io.emit("notification", { message });
  }
}
