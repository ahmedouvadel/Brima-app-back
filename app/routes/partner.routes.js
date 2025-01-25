const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partner.controller');
const upload = require('../config/uploadMiddleware'); 


router.post('/create', upload.array('files'), partnerController.createPartner);
router.get('/partners/:id', partnerController.getPartnerById);
router.get('/partners', partnerController.getAllPartners);

router.put('/update/:id', upload.array('files'), partnerController.updatePartner);


router.delete('/delete/:id', partnerController.deletePartner);
router.get('/count', partnerController.countPartners);
module.exports = router;
