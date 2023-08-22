const dotenv = require('dotenv');

dotenv.config();

const ENV = process.env.NODE_ENV || 'development';

const CORS_OPTIONS = {
    development: {
        origin: 'http://localhost:5002',
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"]
    },
    production: {
        origin: [
            'https://wam-studio.i3s.univ-cotedazur.fr',
            'https://wam-openstudio.vidalmazuy.fr',
            'https://attune.i3s.univ-cotedazur.fr' // <-- Add this line
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
    corsOptions: CORS_OPTIONS[ENV],
    SongTagEnum: {
        LEAD_VOCAL: "lead_vocal",
            BACKING_VOCAL: "backing_vocal",
            ELECTRIC_GUITAR: "electric_guitar",
            ACOUSTIC_GUITAR: "acoustic_guitar",
            BASS: "bass",
            DRUMS: "drums",
            PIANO: "piano",
            SYNTH: "synth",
            STRINGS: "strings",
            BRASS: "brass",
            SNARES: "snares",
            KICKS: "kicks",
            OTHER: "other",
    }
};
