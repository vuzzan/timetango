// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const auth = require('../middleware/auth');

router.get('/events', auth, eventController.getEvents);
router.post('/events', auth, eventController.postEvents);

module.exports = router;