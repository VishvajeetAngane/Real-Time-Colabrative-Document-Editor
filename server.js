const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve static files
app.use(express.static(path.join(__dirname)));

mongoose.connect("mongodb://127.0.0.1:27017/realtime-editor")
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

const docSchema = new mongoose.Schema({ content: String });
const Document = mongoose.model("Document", docSchema);

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("get-document", async (docId) => {
        let document = await Document.findById(docId);
        if (!document) {
            document = await Document.create({ _id: docId, content: "" });
        }
        socket.join(docId);
        socket.emit("load-document", document.content);

        socket.on("save-document", async (content) => {
            await Document.findByIdAndUpdate(docId, { content });
        });

        socket.on("send-changes", (content) => {
            socket.broadcast.to(docId).emit("receive-changes", content);
        });
    });
});

server.listen(3000, () => console.log("Server running on http://localhost:3000"));
