const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("../config");
const utils = require("../utils");

const router = express.Router();

router.post("/login", (req, res) => {
  const { password } = req.body;

  if (password === config.adminPassword) {
    const token = jwt.sign({ role: "admin" }, config.jwtSecret, {
      expiresIn: "1h",
    });

    // Set the JWT as an HTTP-Only cookie
    res.cookie("token", token, {
      httpOnly: true,
      // secure: true, // Uncomment this line to enforce secure (https) cookies
      sameSite: "strict", // Uncomment this line if you want to enforce same site policy
    });

    res.json({ message: "Logged in" });
  } else {
    res.status(401).json({ message: "Invalid admin password" });
  }
});

router.post("/logout", (req, res) => {
  res
    .cookie("token", "loggedout", {
      httpOnly: true,
      sameSite: "strict",
    })
    .json({ message: "Logged out" });
});

router.get("/verify", utils.verifyJWT, (req, res) => {
  res.json({ message: "Valid token" });
});

// ...

module.exports = router;
