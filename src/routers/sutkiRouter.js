const Router = require('express');
const sutkiController = require('../controllers/sutkiController')
const router = new Router();

router.post('/getdatagen', sutkiController.getData);
router.post('/getdatarashod', sutkiController.getDataRashod);
router.post('/getdatatime', sutkiController.getDataTime);

module.exports = router