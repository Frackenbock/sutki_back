const pg = require("pg");
const connectionTo = require('../data/connectionToDb');
const poolAiiskue = new pg.Pool(connectionTo('aiiskue')); //подключение для запросов к БД АИИСКУЭ
const poolSutki = new pg.Pool(connectionTo('sutki')); // подключение для запросов к БД сутки

class itogController{
   async  getItogData(req,res){
      try{
///////////////////запрос за активкой в постгрес
         const aiisDataActive = await poolAiiskue.query(`
               SELECT num_fid,  SUM(val_virab), COUNT(val_virab)
               FROM virabotka_aiiskue 
               WHERE date = $1
               AND type_power = $2
               GROUP BY num_fid
               ORDER BY num_fid 
         `,[req.body.date,2])

         let itogArrActiveUporiad = aiisDataActive.rows.sort((a,b)=>a['num_fid']-b['num_fid'])
         let active=[]
         for (let i=0;i<itogArrActiveUporiad.length;i++){
            active.push([Number(itogArrActiveUporiad[i].num_fid),itogArrActiveUporiad[i].sum, Number(itogArrActiveUporiad[i].count)])
         }
//////////////////////запрос за реактивкой в постгрес
         const aiisDataReactive = await poolAiiskue.query(`
               SELECT num_fid,  SUM(val_virab), COUNT(val_virab)
               FROM virabotka_aiiskue 
               WHERE date = $1
               AND type_power = $2
               GROUP BY num_fid
               ORDER BY num_fid
         `,[req.body.date,1])

         let itogArrReactiveUporiad = aiisDataReactive.rows.sort((a,b)=>a['num_fid']-b['num_fid'])
         let reactive=[]
         for (let i=0;i<itogArrReactiveUporiad.length;i++){
            reactive.push([Number(itogArrReactiveUporiad[i].num_fid),itogArrReactiveUporiad[i].sum, Number(itogArrReactiveUporiad[i].count)])
         }
         res.json({active,reactive})
      }catch(err){
         console.log(err)
      };
   };

   async  saveItogData(req,res){
      try{
/////////////запись в БД постгрес данных времени, напоров, расхода стока, выработки
         const oldDataTimes = await poolSutki.query(`SELECT * FROM times WHERE date = $1`,[req.body.date])
         if(oldDataTimes.rows.length>0){
            await poolSutki.query(`DELETE FROM times WHERE date = $1`,[req.body.date])
         };
         for(let i = 1; i<=24; i++){
            await poolSutki.query(`INSERT INTO times	(date,hour,g1,g2,g3,g4,g5,g6,g7,g8)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
            [req.body.date,i,req.body.arrTimes[i-1].gen1,req.body.arrTimes[i-1].gen2,req.body.arrTimes[i-1].gen3,req.body.arrTimes[i-1].gen4,
            req.body.arrTimes[i-1].gen5,req.body.arrTimes[i-1].gen6,req.body.arrTimes[i-1].gen7,req.body.arrTimes[i-1].gen8]);
         };

         const oldDataNapors = await poolSutki.query(`SELECT * FROM napors WHERE date = $1`,[req.body.date])
         if(oldDataNapors.rows.length>0){
            await poolSutki.query(`DELETE FROM napors WHERE date = $1`,[req.body.date])
         }

         await poolSutki.query(`INSERT INTO napors (date,napor1h,napor2h,napor3h,napor4h,
         napor5h,napor6h,napor7h,napor8h,napor9h,napor10h,napor11h,napor12h,napor13h,napor14h,napor15h,
         napor16h,napor17h,napor18h,napor19h,napor20h,napor21h,napor22h,napor23h,napor24h)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)`,
         [req.body.date,req.body.napors[0].input,req.body.napors[1].input,req.body.napors[2].input,req.body.napors[3].input,req.body.napors[4].input,
         req.body.napors[5].input,req.body.napors[6].input,req.body.napors[7].input,req.body.napors[8].input,req.body.napors[9].input,req.body.napors[10].input,
         req.body.napors[11].input,req.body.napors[12].input,req.body.napors[13].input,req.body.napors[14].input,req.body.napors[15].input,req.body.napors[16].input,
         req.body.napors[17].input,req.body.napors[18].input,req.body.napors[19].input,req.body.napors[20].input,req.body.napors[21].input,req.body.napors[22].input,
         req.body.napors[23].input
         ]);

         const oldDataRashod = await poolSutki.query(`SELECT * FROM full_rashod_stok WHERE date = $1`,[req.body.date])
         if(oldDataRashod.rows.length>0){
            await poolSutki.query(`DELETE FROM full_rashod_stok WHERE date = $1`,[req.body.date])
         }
         await poolSutki.query(`INSERT INTO full_rashod_stok	(date,value_rashod,value_stok,value_virabotka) VALUES ($1,$2,$3,$4)`,
         [req.body.date,req.body.totalRashod,req.body.totalStok,req.body.totalPower])
      }catch(err){
         console.log(err)
      };
   };
};

module.exports =new itogController();
