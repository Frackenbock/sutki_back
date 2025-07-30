const Router = require('express');
const adminMaketController = require('../controllers/adminMaketController')
const router = new Router();

router.post('/getmaketdata', adminMaketController.saveMaketData);


module.exports = router     