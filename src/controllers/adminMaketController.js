const pg = require("pg")
const connectionTo = require('../data/connectionToDb');
const calcNeededDate  = require('../utils/calcNeededDate')
const poolMaket = new pg.Pool(connectionTo('maket17'));

class adminMaketController{

   async saveMaketData(req,res){//сохранение данных макета в БД
		  try{		 
			const allRecords=[];
			let amountDays = ((new Date(req.body.dateEndDiapazone).valueOf()-new Date(req.body.dateBeginDiapazone).valueOf())/86400000);
			for(let i=0;i<=amountDays;i++){
			   const date = calcNeededDate(req.body.dateBeginDiapazone,i)
			   const dateFormat = date.slice(6,10)+'-'+date.slice(3,5)+'-'+date.slice(0,2)
			   const data = await poolMaket.query(`SELECT * FROM maket17 WHERE date=$1`,[dateFormat]);
			   if(data.rows.length!==0){
				  allRecords.push(data.rows)
			   }
			}
			let itog=[];
			for (let i=0;i<allRecords.length;i++){
			   itog = [...itog,...allRecords[i]]
			}
			res.json(itog)
		  }catch(err){
			 res.json(err)
		  }
		}
   };
   
   
module.exports =new adminMaketController();
