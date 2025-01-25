const express = require('express');
const router = express.Router();
const profilPartnerController = require('../controllers/profilPartner.controller');
const upload = require('../config/uploadMiddleware'); 


router.post('/create', upload.array('files'), profilPartnerController.createProfilPartner);
router.get('/profilPartners/:id', profilPartnerController.getProfilPartnerById);
router.get('/profilPartners', profilPartnerController.getAllProfilPartners);

router.put('/update/:id', upload.array('files'), profilPartnerController.updateProfilPartner);

router.get('/user/:userId', profilPartnerController.getProfilPartnersByUserId); 
router.delete('/delete/:id', profilPartnerController.deleteProfilPartner);
router.get('/count', profilPartnerController.countProfilPartners);

router.get('/count-by-category', profilPartnerController.countProfilPartnersByCategory);
module.exports = router;
