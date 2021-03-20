const express = require("express");
const dotenv = require("dotenv").config();
require("./src/config/database");

const app = express();

app.listen(process.env.PORT, () => {
  console.log("Server 3000 port is listening");
});
