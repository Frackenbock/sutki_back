const pg = require("pg");
const connectionTo = require('../data/connectionToDb');
const pool = new pg.Pool(connectionTo('pbr')); 
const normalizeDateYesterday  = require('../utils/calcNeededDateYesterday')

class raportController{
   async  getPbrData(req,res){
     // запрос в бд за данными ПБР
      try{
            let dateNeeded = req.body.date.slice(6,10)+'-'+req.body.date.slice(3,5)+'-'+req.body.date.slice(0,2)

            let dataPostgresYesterday = await pool.query(`SELECT hour,date,power,file_name FROM pbr WHERE date=$1 ORDER BY hour`,[normalizeDateYesterday(req.body.date)]);
            let itogPBRarr=[];
            for (let i=6;i<dataPostgresYesterday.rows.length;i++){
               itogPBRarr.push([dataPostgresYesterday.rows[i].hour,dataPostgresYesterday.rows[i].date,dataPostgresYesterday.rows[i].power,dataPostgresYesterday.rows[i].file_name])
            }
            let dataPostgresToday = await pool.query(`SELECT hour,date,power,file_name FROM pbr WHERE date=$1 ORDER BY hour`,[dateNeeded]);
            for (let i=1;i<=dataPostgresToday.rows.length-19;i++){
               itogPBRarr.push([dataPostgresToday.rows[i].hour,dataPostgresToday.rows[i].date,dataPostgresToday.rows[i].power,dataPostgresToday.rows[i].file_name])
            }
            res.json(itogPBRarr);
      }catch(err){
         console.log(err)
      };
   };
};

module.exports =new raportController();
