const express = require('express');
const jwt = require('jsonwebtoken');
const config= require('../config');
const utils = require('../utils');


const allowedOrigins = ['https://wam-studio.i3s.univ-cotedazur.fr', 'http://localhost:5002'];

const cors= (req,res,next)=>{
    console.log("### authroutes",req.method, req.url)
    //res.set('Access-Control-Allow-Origin',['*'])
    // MB
    const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    console.log("adding Access-Control-Allow-Origin header " + origin);
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    console.log("OPTIONS preflight request received!")
    return res.sendStatus(200); // Preflight request is successful.
  }
  next();
}

const router = express.Router();
router.use(cors);

router.post('/login', (req, res) => {
    const { password } = req.body;

    if (password === config.adminPassword) {
        const token = jwt.sign({ role: 'admin' }, config.jwtSecret, { expiresIn: '1h' });

        // Set the JWT as an HTTP-Only cookie
        res.cookie('token', token, {
            httpOnly: true,
            // secure: true, // Uncomment this line to enforce secure (https) cookies
            sameSite: 'strict' // Uncomment this line if you want to enforce same site policy
        });

        res.json({ message: 'Logged in' });
    } else {
        res.status(401).json({ message: 'Invalid admin password' });
    }
});

router.post('/logout', (req, res) => {
    res.cookie('token', "loggedout", {
        httpOnly: true,
        sameSite: 'strict'
    }).json({ message: 'Logged out' });
});

router.get('/verify', utils.verifyJWT, (req, res) => {
    res.json({ message: 'Valid token' });
});

// ...

module.exports = router;
