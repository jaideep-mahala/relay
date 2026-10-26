import { WebSocketServer } from "ws";
import mongoose from "mongoose";
import { UserManager } from "./UserManager";

mongoose
  .connect(process.env.DB_URL ?? "mongodb://localhost:27017/relay")
  .then(() => {
    console.log("MongoDB connected");

    const server = new WebSocketServer({ port: 5000 });

    server.on("connection", (ws) => {
      const user = UserManager.getInstance().addUser(ws);

      ws.on("message", (message) => {
        try {
          const parsedMessage = JSON.parse(message.toString());
          user
            .handleIncomingMessage(parsedMessage)
            .then((payload) => {
              user.sendMessage(payload);
            })
            .catch((e) => {
              console.log(e);
            });
        } catch (e) {
          console.log("User sent non-JSON formatted input");
          console.log(e);
        }
      });
    });
  })
  .catch((e) => {
    console.log(e);
  });
