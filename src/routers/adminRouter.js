const Router = require('express');
const adminController = require('../controllers/adminController')
const router = new Router();

router.post('/getdatauvb', adminController.getDataUVB);
router.post('/getdatanapors', adminController.getDataNapors);
router.post('/deleterecorduvb', adminController.deleteRecordUVB);
router.post('/deleterecordnapor', adminController.deleteRecordNapor);
router.post('/addrecordnapor', adminController.addRecordNapor);
router.post('/addrecorduvb', adminController.addRecordUVB);
router.post('/getdatarashods', adminController.getRecordRashods);

module.exports = router     