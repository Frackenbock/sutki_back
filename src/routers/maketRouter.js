const Router = require('express');
const itogController = require('../controllers/maketController')
const router = new Router();

router.post('/sendmaket', itogController.sendMaketData);
router.post('/savemaket', itogController.saveMaketData);
router.post('/getmaket', itogController.getMaketData);
router.get('/getemails', itogController.getEmailsData);
router.post('/addnewemail', itogController.addNewEmail);
router.post('/deleteemail', itogController.deleteEmail);
router.post('/getproduction', itogController.getProductionData);
router.post('/saveip', itogController.saveIp);
router.post('/savename', itogController.saveName);
router.post('/savepassw', itogController.savePassw);
router.get('/getallparams', itogController.getallparams);

module.exports = router