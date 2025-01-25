const express = require('express');
const router = express.Router();
const formulairePartnerController = require('../controllers/formulairePartner.controller');
const upload = require('../config/uploadMiddleware'); 


router.post('/create', upload.array('files'), formulairePartnerController.createFormulairePartner);
router.get('/formulairePartners/:id', formulairePartnerController.getFormulairePartnerById);
router.get('/formulairePartners', formulairePartnerController.getAllFormulairePartners);

router.put('/update/:id', upload.array('files'), formulairePartnerController.updateFormulairePartner);
router.put('/:id/status', formulairePartnerController.updateFormulairePartnerStatus);

router.delete('/delete/:id', formulairePartnerController.deleteFormulairePartner);

module.exports = router;
