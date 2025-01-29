const express = require('express');
const router = express.Router();
const cartaController = require('../controllers/carta.controller');

router.post('/:cartId/add', cartaController.addToCarta);
router.get('/:cartId/getCarta', cartaController.getCarta);
router.post('/:cartId/userinfo', cartaController.updateCartWithUserInfo);
router.delete('/:cartId/items/:itemId', cartaController.removeItemFromCart);
router.put('/:cartId/items/:itemId', cartaController.updateItemQuantity);
router.get('/all', cartaController.getAllCarts);
router.get('/count', cartaController.countCarts);
router.get('/count-by-week', cartaController.countCartsByWeek);

// Add these new routes
router.put('/:cartId/items/:itemId/increment', cartaController.incrementItemQuantity);
router.put('/:cartId/items/:itemId/decrement', cartaController.decrementItemQuantity);


module.exports = router;
