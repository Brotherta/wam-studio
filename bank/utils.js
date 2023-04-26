// Middleware to verify JWT token
const jwt = require('jsonwebtoken');
const fs = require('fs');

const jwtSecret = process.env.JWT_SECRET;

function verifyJWT(req, res, next) {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).send('Access denied. No token provided.');
    }

    const token = authHeader.split(' ')[1]; // Extract the token from the Bearer string

    try {
        req.user = jwt.verify(token, jwtSecret);
        next();
    } catch (error) {
        res.status(400).send('Invalid token.');
    }
}

// Function to read and parse JSON file
function readJSONFile(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

// Function to write JSON to a file
function writeJSONFile(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = { verifyJWT, readJSONFile, writeJSONFile };