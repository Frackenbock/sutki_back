const Router = require('express');
const logsController = require('../controllers/logsController')
const router = new Router();


router.post('/getvirablogs', logsController.getLogsVirab);
router.delete('/deletevirablogs', logsController.deleteLogsVirab);



module.exports = router     