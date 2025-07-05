// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const auth = require('../middleware/auth');

router.post('/dtshops', auth, shopController.dtShops);

module.exports = router;