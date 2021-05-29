const express = require("express");
const dotenv = require("dotenv").config();
require("./src/config/database");
const HttpError = require("./src/error/HttpError");
const authUserRouter = require("./src/router/auth_user_router");
const authMentorRouter = require("./src/router/auth_mentor_router");
const path = require("path");
const server = require("http");
const sockecIO = require("socket.io");
const { v4 } = require("uuid");

const app = express();

const serve = server.Server(app);
const io = sockecIO(serve);
const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "src/uploads")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

app.use("/api/users", authUserRouter);
app.use("/api/mentors", authMentorRouter);

app.use("/join", (req, res, next) => {
  res.send({ link: v4() });
});

app.use((req, res, next) => {
  const error = new HttpError("Could not be found this route", 404);
  next(error);
});

io.on("connection", (socket) => {
  console.log("socket established");
  socket.on("join-room", (userData) => {
    const { roomID, userID } = userData;
    socket.join(roomID);
    socket.to(roomID).broadcast.emit("new-user-connect", userData);
    socket.on("disconnect", () => {
      socket.to(roomID).broadcast.emit("user-disconnected", userID);
    });
    socket.on("broadcast-message", (message) => {
      socket
        .to(roomID)
        .broadcast.emit("new-broadcast-messsage", { ...message, userData });
    });
    // socket.on('reconnect-user', () => {
    //     socket.to(roomID).broadcast.emit('new-user-connect', userData);
    // });
    socket.on("display-media", (value) => {
      socket.to(roomID).broadcast.emit("display-media", { userID, value });
    });
    socket.on("user-video-off", (value) => {
      socket.to(roomID).broadcast.emit("user-video-off", value);
    });
  });
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res
    .status(error.code || 500)
    .json({ message: error.message || "An unknown error occured." });
});

serve
  .listen(port, () => {
    console.log(`Listening on the port ${port}`);
  })
  .on("error", (e) => {
    console.error(e);
  });
