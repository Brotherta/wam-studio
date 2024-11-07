const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const config = require("./config");
// put all utility functions here, for example:

function verifyJWT(req, res, next) {
  if (!req.cookies || !req.cookies.token) {
    return res.status(401).send("Access denied. No token provided.");
  }

  const token = req.cookies.token; // Extract the token from the cookie
  try {
    req.user = jwt.verify(token, config.jwtSecret);
    next();
  } catch (error) {
    res.status(400).send("Invalid token.");
  }
}

function readJSONFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJSONFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function checkEnvVars() {
  if (!config.jwtSecret || !config.adminPassword) {
    console.error("Environment variables not set.");
    process.exit(1);
  }
}

function createDirectories() {
  if (!fs.existsSync(config.storageDir)) {
    fs.mkdirSync(config.storageDir);
  }
}

function createFiles() {
  // Create projects.json file if it doesn't exist
  if (!fs.existsSync(config.storageDir + "/projects.json")) {
    writeJSONFile(config.storageDir + "/projects.json", []);
  }

  // Create presets.json file if it doesn't exist
  if (!fs.existsSync(config.storageDir + "/presets.json")) {
    let tags = [];
    for (let key in config.SongTagEnum) {
      tags.push({
        tag: config.SongTagEnum[key],
        presets: [],
      });
    }
    writeJSONFile(config.storageDir + "/presets.json", tags);
  }
}

module.exports = {
  verifyJWT,
  readJSONFile,
  writeJSONFile,
  checkEnvVars,
  createDirectories,
  createFiles,
};
