const express = require("express");
const cors = require("cors");
const path = require("path");
const plugins = require("./plugins.json");

const app = express();
const port = process.env.PORT || 7002;
const HTTPS = process.env.HTTPS || false;

app.use(cors());


// app.enable("trust proxy");

app.use((req, res, next) => {
  res.header("Cross-Origin-Resource-Policy", "cross-origin");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

app.get("/wams", (req, res) => {
  res.send(plugins.map((plugin) => `${HTTPS ? 'https' : 'http'}://${req.get("Host")}/plugins/${plugin}/`));
});

app.use("/", express.static(path.join(__dirname, "./PedalBoard")));

app.use("/plugins", express.static(path.join(__dirname, "./plugins")));

app.use("/songs", express.static(path.join(__dirname, "./songs")));

app.listen(port, () => {
  console.log(`App working on http://localhost:${port}`);
});
