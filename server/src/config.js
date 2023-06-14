const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    config: {
        storageDir: process.env.STORAGE_DIR || 'storage',
        adminPassword: process.env.ADMIN_PASSWORD,
        jwtSecret: process.env.JWT_SECRET,
        port: process.env.PORT || 6002,
        corsOptions: {
            origin: 'http://localhost:5002',
            credentials: true,
        },
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
    },
    utils: require('./utils')
};
