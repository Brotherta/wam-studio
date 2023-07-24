const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const HTTPS = process.env.HTTPS === "true";
const PORT = process.env.PORT || 8002;
console.log("FRONT: ", process.env.BACKEND_URL);



// Set headers
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    next();
});

// Serve your webpack-built static files
app.use(express.static(path.join(__dirname, 'dist')));

// Handle /:id route
app.get('/:id', (req, res, next) => {
    // Get the id from the request params
    const myId = req.params.id;

    // Read the main HTML file
    const filePath = path.join(__dirname, 'dist', 'index.html');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file from disk: ${err}`);
            res.status(500).send('Server error');
        } else {
            // Insert the script that sets window.myId
            const modifiedData = data.replace(
                '<head>',
                `\n<head>\n<script>window.myId = "${myId}";</script>\n`
            );

            // Send the modified HTML file
            res.send(modifiedData);
        }
    });
});



if (HTTPS) {
    // HTTPS server
    const keyPath = process.env.SSL_KEY_FILE;
    const certPath = process.env.SSL_CERT_FILE;
    const privateKey = fs.readFileSync(keyPath, 'utf8');
    const certificate = fs.readFileSync(certPath, 'utf8');
    const credentials = { key: privateKey, cert: certificate };
    const httpsServer = https.createServer(credentials, app);

    httpsServer.listen(PORT, () => {
        console.log(`HTTPS Server running on https://localhost:${PORT}`);
    });
}

else {
    // HTTP server
    app.listen(PORT, () => {
        console.log(`HTTP Server running on http://localhost:${PORT}`);
    });
}


