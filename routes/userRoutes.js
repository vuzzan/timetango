// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post('/login', userController.login);            // 
router.post('/logout', auth, userController.logout);     // 
router.get('/me', auth, userController.getMe);    // Route được bảo vệ
router.post('/me', auth, userController.getMe);    // Route được bảo vệ
router.post('/users', auth, userController.getUsers);    // Route được bảo vệ

router.post('/dtusers', auth, userController.dtUsers);    // Route được bảo vệ
router.post('/dtcustomers', auth, userController.dtCustomers);    // Route được bảo vệ

module.exports = router;