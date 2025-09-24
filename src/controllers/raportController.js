const pg = require("pg");
const connectionTo = require('../data/connectionToDb');
const poolPBR = new pg.Pool(connectionTo('pbr')); 
const poolSutki = new pg.Pool(connectionTo('sutki')); 
const poolAiis = new pg.Pool(connectionTo('aiiskue'));
const poolMaket = new pg.Pool(connectionTo('maket17'));
const normalizeDateYesterday  = require('../utils/calcNeededDateYesterday')

class raportController{
   async  getPbrData(req,res){
     // запрос в бд за данными ПБР
      try{
            let dateNeeded = req.body.date.slice(6,10)+'-'+req.body.date.slice(3,5)+'-'+req.body.date.slice(0,2)
///////////////////////////////////////////////////////////////////////////////
///////////данные ПБР//////////////////////////////////////////////////////////
            let dataPostgresYesterday = await poolPBR.query(`SELECT hour,date,power,file_name FROM pbr WHERE date=$1 ORDER BY hour`,[normalizeDateYesterday(req.body.date).dateTire]);
            let itogPBRarr=[];
            for (let i=6;i<dataPostgresYesterday.rows.length;i++){
               itogPBRarr.push([dataPostgresYesterday.rows[i].hour,dataPostgresYesterday.rows[i].date,dataPostgresYesterday.rows[i].power,dataPostgresYesterday.rows[i].file_name])
            }
            let dataPostgresToday = await poolPBR.query(`SELECT hour,date,power,file_name FROM pbr WHERE date=$1 ORDER BY hour`,[dateNeeded]);
            for (let i=1;i<=dataPostgresToday.rows.length-19;i++){
               itogPBRarr.push([dataPostgresToday.rows[i].hour,dataPostgresToday.rows[i].date,dataPostgresToday.rows[i].power,dataPostgresToday.rows[i].file_name])
            }
////////////////////////////////////////////////////////////////////////////////////////////
//////////данные выработки  ////////////////////////////////////////////////////////////////
         const aiisDataActiveOne = await poolAiis.query//выгрузка из БД данных АИИСКУЭ за дату предшествующую дате из запроса
            (` SELECT num_poluchas, num_fid, val_virab
               FROM virabotka_aiiskue 
               WHERE date = $1
               AND type_power = $2
               AND ((num_fid=$3) OR (num_fid=$4) OR (num_fid=$5) OR (num_fid=$6) OR (num_fid=$7) OR (num_fid=$8) OR (num_fid=$9) OR (num_fid=$10))
               ORDER BY  num_poluchas
         `,[normalizeDateYesterday(req.body.date).dateDotted,2,'1','2','3','4','5','6','7','8'])

         const aiisDataActiveTwo = await poolAiis.query//выгрузка из БД данных АИИСКУЭ за дату из запроса
            (`SELECT num_poluchas, num_fid, val_virab
               FROM virabotka_aiiskue 
               WHERE date = $1
               AND type_power = $2
               AND ((num_fid=$3) OR (num_fid=$4) OR (num_fid=$5) OR (num_fid=$6) OR (num_fid=$7) OR (num_fid=$8) OR (num_fid=$9) OR (num_fid=$10))
               ORDER BY  num_poluchas
         `,[req.body.date,2,'1','2','3','4','5','6','7','8'])

         let virabArrOne=[];//суммирование выработки по генераторм за получасовки за дату предшествующую дате из запроса 
         for(let j=0;j<48;j++){
            let elem=0
            for (let i=0;i<aiisDataActiveOne.rows.length;i++){
               if(j+1===Number(aiisDataActiveOne.rows[i].num_poluchas)){
                  elem = elem+=aiisDataActiveOne.rows[i].val_virab
               }
            }
             virabArrOne.push({summ:elem.toFixed(2),num_poluchas:j+1})    
         }

         let virabArrTwo=[];//суммирование выработки по генераторм за получасовки за дату из запроса 
         for(let j=0;j<48;j++){
            let elem=0
            for (let i=0;i<aiisDataActiveTwo.rows.length;i++){
               if(j+1===Number(aiisDataActiveTwo.rows[i].num_poluchas)){
                  elem = elem+=aiisDataActiveTwo.rows[i].val_virab
               }
            }
             virabArrTwo.push({summ:elem.toFixed(2),num_poluchas:j+1})    
         }

         let arrItogVirab=[]//результирующий массив данных выработки

         for(let j=10;j<virabArrOne.length;j+=2){//суммируем получасовки и добавляем в результирующий массив за дату предшествующую дате из запроса 
            arrItogVirab.push( [(Number(virabArrOne[j].summ)+Number(virabArrOne[j+1].summ)).toFixed(2),j/2+1])
         }
         for(let j=0;j<virabArrTwo.length-36;j+=2){//суммируем получасовки и добавляем в результирующий массив за дату из запроса 
            arrItogVirab.push([(Number(virabArrTwo[j].summ)+Number(virabArrTwo[j+1].summ)).toFixed(2),j/2+1])
         }
/////////////////////////////////////////////////////////////////////////////////
/////////////////данные напоров/////////////////////////////////////////////////
         const dataNaporsOne = await poolSutki.query(`SELECT * FROM napors WHERE date=$1`,
            [normalizeDateYesterday(req.body.date).dateDotted]);//выгрузка из БД данных напоров за дату предшествующую дате из запроса
         const dataNaporsTwo = await poolSutki.query(`SELECT * FROM napors WHERE date=$1`,[req.body.date]);//выгрузка из БД данных напоров за дату из запроса
         let itogArrNapors=[]
         for (let key in dataNaporsOne.rows[0]){
            for(let j=6; j<=24; j++){
               if(key.includes(j)){
                  itogArrNapors.push([j,dataNaporsOne.rows[0][key]])
                  break;
               }
            }
         }
         if(dataNaporsTwo.rows.length===0){
            for(let j=1; j<=6; j++){
               itogArrNapors.push([j,''])
            }
         }else{
            for (let key in dataNaporsOne.rows[0]){
               for(let j=1; j<=6; j++){
                  if(key.includes(j)){
                     itogArrNapors.push([j,dataNaporsOne.rows[0][key]])
                  }
               }
            }
         }
//////////////////////////////////////////////////////////////////////////
////////////данные от макета №17////////////////////////////////////////////
      let maket = {}

      // const aiisDataActive = await poolSutki.query(`SELECT * FROM full_rashod_stok WHERE date=$1`,[normalizeDateYesterday(req.body.date).dateDotted]);

		const data = await poolMaket.query(`SELECT * FROM maket17 WHERE date=$1`,[normalizeDateYesterday(req.body.date).dateTire]);
      maket = {...data.rows[0]}

      // console.log(maket)
         // let itogArrActiveUporiad = aiisDataActive.rows.sort((a,b)=>a['num_fid']-b['num_fid'])
         // let active=[]
         // for (let i=0;i<itogArrActiveUporiad.length;i++){
         //    active.push([Number(itogArrActiveUporiad[i].num_fid),itogArrActiveUporiad[i].sum, Number(itogArrActiveUporiad[i].count)])
         // }
         res.json({arrItogVirab,itogPBRarr,itogArrNapors,raportMaketData:maket});
      }catch(err){
         console.log(err)
      }
   };
};

module.exports =new raportController();
