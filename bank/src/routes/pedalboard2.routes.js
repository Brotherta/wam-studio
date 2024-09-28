const express = require('express');
const fs = require('fs');
const path = require('path');
const pedalboard2 = require('../../pedalboard2/server/handler.js');

const router = express.Router();

router.use('/pedalboard2',pedalboard2.pedalboard2_bin)
router.use('/pedalboard2',pedalboard2.pedalboard2_static)

router.use('/',pedalboard2.pedalboard2_bin)
router.use('/',pedalboard2.pedalboard2_static)

router.use('/wam_api_library.json',pedalboard2.wam_api_library)

module.exports = router

