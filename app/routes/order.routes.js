const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');

// Add new route for creating an order
router.post('/:cartId/checkout', orderController.createOrderFromCart);

module.exports = router;