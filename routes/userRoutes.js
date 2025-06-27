// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post('/login', userController.login);            // 
router.post('/logout', auth, userController.logout);     // 
router.get('/me', auth, userController.getMe);    // Route được bảo vệ
router.get('/users', auth, userController.getUsers);    // Route được bảo vệ

module.exports = router;