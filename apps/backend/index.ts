import { WebSocketServer } from "ws";
import mongoose from "mongoose";
import { WorkspaceModel } from "db/client";

mongoose.connect(process.env.DB_URL!)
.then(() => {
    const server = new WebSocketServer({port: 5000});

    server.on("connection" , (ws) =>{
        ws.on("message" , (msg) => {
            WorkspaceModel.create({
                path: "123",
                name: "123321"
            })

        })
    })
})


