const dotenv = require('dotenv');

dotenv.config();

const ENV = process.env.NODE_ENV || 'development';

const CORS_OPTIONS = {
    development: {
        origin: '*',
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"]
    },
    production: {
        origin: '*',
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
    corsOptions: CORS_OPTIONS[ENV],
};