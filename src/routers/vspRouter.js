const Router = require('express');
const vspController = require('../controllers/vspController')
const router = new Router();


router.post('/getdatavspmagazineinterpol', vspController.getDataMagazineInterpol);
router.post('/setdatarecordvsp', vspController.setDataRecordMagazine);
router.post('/getdataforrashod', vspController.getDataForRashod);
router.post('/getrecordsvsp', vspController.getMagazineRecords);
router.post('/seteditedrecordsvsp', vspController.setEditedMagazineRecord);
router.post('/deleterecordmagazine', vspController.deleteMagazineRecord);
router.post('/getdataforhourrecordsvsp', vspController.getDataForHoursRecord);//для часовых значений всп (получение данных журнала и увб за передаваемую дату)
router.post('/getuvbdatavormagazine', vspController.getDataForMagazineRecord);
router.get('/getallinterpolationdata', vspController.getAllInterpolationData);



module.exports = router     