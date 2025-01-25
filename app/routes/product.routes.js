const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const upload = require('../config/uploadMiddleware'); 


router.post('/create', upload.array('files'), productController.createProduct);
router.get('/products/:id', productController.getProductById);
router.get('/products', productController.getAllProducts);

router.put('/update/:id', upload.array('files'), productController.updateProduct);


router.delete('/delete/:id', productController.deleteProduct);
router.get('/count', productController.countProducts);

router.get('/count-by-category', productController.countProductsByCategory);
module.exports = router;
