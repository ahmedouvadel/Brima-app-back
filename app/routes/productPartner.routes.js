const express = require('express');
const router = express.Router();
const productPartnerController = require('../controllers/productPartner.controller');
const upload = require('../config/uploadMiddleware'); 


router.post('/create', upload.array('files'), productPartnerController.createProductPartner);
router.get('/productPartners/:id', productPartnerController.getProductPartnerById);
router.get('/productPartners', productPartnerController.getAllProductPartners);

router.put('/update/:id', upload.array('files'), productPartnerController.updateProductPartner);

router.get('/user/:userId', productPartnerController.getProductPartnersByUserId); 
router.delete('/delete/:id', productPartnerController.deleteProductPartner);
router.get('/count', productPartnerController.countProductPartners);

router.get('/count-by-category', productPartnerController.countProductPartnersByCategory);
module.exports = router;
