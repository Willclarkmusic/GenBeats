const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ credentials: true, origin: "*" }));
app.use(express.json());
// app.use(express.static("dist"));

app.use("/api/generate", require("./routes/GenerateRoute.ts"));

const os = require("os");
const e = require("express");
const hostname = os.hostname();

app.listen(PORT, "0.0.0.0", () => {
  // flip server should automatically match whatever server you're on
  console.log(`From server.ts Server running:  http://${hostname}:${PORT}...`);
});
