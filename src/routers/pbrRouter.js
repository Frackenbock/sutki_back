const Router = require('express');
const pbrController = require('../controllers/pbrController')
const router = new Router();

router.post('/getdatapbr', pbrController.getPbrData);

module.exports = router