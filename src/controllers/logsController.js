const calcNeededDate  = require('../utils/calcNeededDate')
const pg = require("pg");
const connectionTo = require('../data/connectionToDb');
const poolSutki = new pg.Pool(connectionTo('sutki')); 
 
class logsController{
   async getLogsVirab(req,res){
      try{
         const allRecords=[];
         let amountDays = ((new Date(req.body.dateEndDiapazone).valueOf()-new Date(req.body.dateBeginDiapazone).valueOf())/86400000);
         for(let i=0;i<=amountDays;i++){
            const date = calcNeededDate(req.body.dateBeginDiapazone,i)
            const data = await poolSutki.query(`SELECT * FROM log WHERE date=$1`,[date]);
            if(data.rows.length!==0){
               allRecords.push(data.rows)
            }
         }
         let itog=[];
         for (let i=0;i<allRecords.length;i++){
            itog = [...itog,...allRecords[i]]
         }
         res.json(itog)
      }catch(e){
         console.log(e)
      }
   }
   async deleteLogsVirab(req,res){
      try{
         await poolSutki.query(`DELETE FROM log`);
         res.json('Все данные логов успешно удалены')
      }catch(e){
         console.log(e)
      }
   }
};  
module.exports =new logsController(); 
 