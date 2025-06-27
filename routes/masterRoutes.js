// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const masterController = require('../controllers/masterController');
const auth = require('../middleware/auth');

router.get('/mstData', auth, masterController.getEvents);

module.exports = router;