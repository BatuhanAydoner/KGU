const express = require("express");
const dotenv = require("dotenv").config();
require("./src/config/database");
const HttpError = require("./src/error/HttpError");
const authUserRouter = require("./src/router/auth_user_router");
const authMentorRouter = require("./src/router/auth_mentor_router");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.use((req, res, next) => {
  const error = new HttpError("Could not be found this route", 404);
  next(error);
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res
    .status(error.code || 500)
    .json({ message: error.message || "An unknown error occured." });
});

app.listen(process.env.PORT, () => {
  console.log("Server 3000 port is listening");
});
