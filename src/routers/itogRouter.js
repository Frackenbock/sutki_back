const Router = require('express');
const itogController = require('../controllers/itogController')
const router = new Router();

router.post('/getdataitog', itogController.getItogData);
router.post('/savetime', itogController.saveItogData);

module.exports = router