const Router = require('express');
const raportController = require('../controllers/raportController')
const router = new Router();

router.post('/getdatapbr', raportController.getPbrData);

module.exports = router