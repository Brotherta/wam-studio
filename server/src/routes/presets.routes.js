const express = require('express');
const config= require('../config');
const utils = require('../utils');

const router = express.Router();

// Route to save the presets
router.post('/presets', utils.verifyJWT, (req, res) => {
    const presets = req.body;
    console.log(presets)
    utils.writeJSONFile(config.storageDir+'/presets.json', presets);
    res.json({ message: 'Presets saved' });
});

// Route to get the presets
router.get('/presets', (req, res) => {
    const presets = utils.readJSONFile(config.storageDir+'/presets.json');
    res.json(presets);
});

module.exports = router;
