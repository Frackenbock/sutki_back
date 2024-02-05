const pg = require("pg");
const connectionTo = require('../data/connectionToDb');
const pool = new pg.Pool(connectionTo('pbr')); 

class pbrController{
   async  getPbrData(req,res){
     // запрос в бд за данными ПБР
      try{
         let dateNeeded = req.body.date.slice(6,10)+'-'+req.body.date.slice(3,5)+'-'+req.body.date.slice(0,2)
         let dataPostgres = await pool.query(`
         SELECT hour,date,power,file_name FROM pbr WHERE date=$1
         ORDER BY hour`,[dateNeeded]);
         let arrPostPBR=[];
         for (let i=0;i<dataPostgres.rows.length;i++){
            arrPostPBR.push([dataPostgres.rows[i].hour,dataPostgres.rows[i].date,dataPostgres.rows[i].power,dataPostgres.rows[i].file_name])
         }
         arrPostPBR=arrPostPBR.slice(1,arrPostPBR.length)
         res.json(arrPostPBR);
      }catch(err){
         console.log(err)
      };
   };
};

module.exports =new pbrController();
