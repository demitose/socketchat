const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server);

const onlineUsers = {};

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  console.log("a user connected");


  socket.on("join", (nickname) => {
    onlineUsers[socket.id] = nickname;
    io.emit("chat message", `${nickname} has joined the chat`);
    io.emit("update online users", Object.values(onlineUsers));
  });

  socket.on("disconnect", () => {
    const nickname = onlineUsers[socket.id];
    delete onlineUsers[socket.id];
    io.emit("chat message", `${nickname} has left the chat`);
    io.emit("update online users", Object.values(onlineUsers));
    console.log("user disconnected");
  });

  socket.on("chat message", (msg) => {
    const nickname = onlineUsers[socket.id];
    io.emit("chat message", { nickname, msg });
  });

  socket.on("typing", () => {
    const nickname = onlineUsers[socket.id];
    socket.broadcast.emit("user typing", `${nickname} is typing...`);
  });


  socket.on("stopped typing", () => {
    socket.broadcast.emit("user stopped typing");
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
