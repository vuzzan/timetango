// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');
const auth = require('../middleware/auth');

router.get('/owners', auth, ownerController.getData);

module.exports = router;