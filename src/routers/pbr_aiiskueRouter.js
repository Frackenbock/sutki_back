const Router = require('express');
const pbr_aiiskueController = require('../controllers/pbr_aiiskueController')
const router = new Router();

router.post('/getdatapower', pbr_aiiskueController.getDataPower);
router.post('/getdataproduction', pbr_aiiskueController.getDataProduction);

module.exports = router