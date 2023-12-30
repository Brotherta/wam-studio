const dotenv = require('dotenv');

dotenv.config();

const CORS_OPTIONS = {
    all: {
        origin: '*',
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"]
    },
    verified: {
        origin: [
            'http://localhost:5002',
            'https://wam-studio.vidalmazuy.fr',
            'https://wam-studio.i3s.univ-cotedazur.fr/'
        ],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"]
    }
}

module.exports = {
    storageDir: process.env.STORAGE_DIR || 'storage',
    adminPassword: process.env.ADMIN_PASSWORD,
    jwtSecret: process.env.JWT_SECRET,
    HTTPS: process.env.HTTPS === "true",
    port: process.env.PORT || 6002,
    corsOptions: CORS_OPTIONS,
};