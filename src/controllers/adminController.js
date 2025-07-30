const calcNeededDate  = require('../utils/calcNeededDate')
const pg = require("pg");
const connectionTo = require('../data/connectionToDb');
const poolVSP = new pg.Pool(connectionTo('vspdata'));  
const poolSutki = new pg.Pool(connectionTo('sutki')); 

class adminController{
   async  getDataUVB(req,res){ //получение данных УВБ
      try{       
         const allRecords=[];
         let amountDays = ((new Date(req.body.dateEndWithoutNorm).valueOf()-new Date(req.body.dateBeginWithoutNorm).valueOf())/86400000);
         for(let i=0;i<=amountDays;i++){
            const date = calcNeededDate(req.body.dateBeginWithoutNorm,i)
            const data = await poolVSP.query(`SELECT * FROM hours_uvb_for_vsp WHERE date=$1`,[date]);
            allRecords.push(data.rows)
         }
         let itog=[];
         for (let i=0;i<=amountDays;i++){
            itog = [...itog,...allRecords[i]]
            }
         if(itog.length!==0){
            res.json(itog)
         }else{
            res.json("За выбранный диапазон дат отсутствуют данные")
         }
      }catch(err){
         res.json(err)
      };
   };
   async  deleteRecordUVB(req,res){//удаление записи УВБ 
      try{       
         await poolVSP.query(`DELETE FROM hours_uvb_for_vsp WHERE date=$1`,[req.body.date]);
         const allRecords=[];
         let amountDays = ((new Date(req.body.dateEndWithoutNorm).valueOf()-new Date(req.body.dateBeginWithoutNorm).valueOf())/86400000);
         for(let i=0;i<=amountDays;i++){
            const date = calcNeededDate(req.body.dateBeginWithoutNorm,i)
            const data = await poolVSP.query(`SELECT * FROM hours_uvb_for_vsp WHERE date=$1`,[date]);
            allRecords.push(data.rows)
         }
         let itog=[];
         for (let i=0;i<=amountDays;i++){
            itog = [...itog,...allRecords[i]]
            }
         if(itog.length!==0){
            res.json(itog)
         }else{
            res.json("За выбранный диапазон дат отсутствуют данные")
         }

      }catch(err){
         res.json(err)
      };
   };
   async  addRecordUVB(req,res){//добавление записи УВБ 
      try{       
         const dataCheck = await poolVSP.query(`SELECT * FROM hours_uvb_for_vsp WHERE date=$1`,[req.body.date])
         if(dataCheck.rows.length!==0){
            res.json("Для выбранной даты уже существует запись. Сначала удалите старую запись, после запишите новую.")
         }else{
            await poolVSP.query(`INSERT INTO hours_uvb_for_vsp (date,uvb_1,uvb_2,uvb_3,uvb_4,uvb_5,uvb_6,uvb_7,uvb_8,uvb_9,
            uvb_10,uvb_11,uvb_12,uvb_13,uvb_14,uvb_15,uvb_16,uvb_17,uvb_18,uvb_19,uvb_20,uvb_21,uvb_22,uvb_23,uvb_24,id) 
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26)`,
            [req.body.date,req.body.arr[0],req.body.arr[1],req.body.arr[2],req.body.arr[3],req.body.arr[4],req.body.arr[5],req.body.arr[6],
             req.body.arr[7],req.body.arr[8],req.body.arr[9],req.body.arr[10],req.body.arr[11],req.body.arr[12],req.body.arr[13],req.body.arr[14],
             req.body.arr[15],req.body.arr[16],req.body.arr[17],req.body.arr[18],req.body.arr[19],req.body.arr[20],req.body.arr[21],req.body.arr[22],
             req.body.arr[23],req.body.id
            ]);
            const allRecords=[];
            let amountDays = ((new Date(req.body.dateEndWithoutNorm).valueOf()-new Date(req.body.dateBeginWithoutNorm).valueOf())/86400000);

            for(let i=0;i<=amountDays;i++){
               const date = calcNeededDate(req.body.dateBeginWithoutNorm,i)
               const data = await poolVSP.query(`SELECT * FROM hours_uvb_for_vsp WHERE date=$1`,[date]);
               allRecords.push(data.rows)
            }
            let itog=[];
            for (let i=0;i<=amountDays;i++){
               itog = [...itog,...allRecords[i]]
               }
            if(itog.length!==0){
               res.json(itog)
            }else{
               res.json("За выбранный диапазон дат отсутствуют данные")
            }
         }
      }catch(err){
         res.json(err)
      };
   };
   async  getDataNapors(req,res){//получение данных напоров
      try{        
         const allRecords=[];
         let amountDays = ((new Date(req.body.dateEndWithoutNorm).valueOf()-new Date(req.body.dateBeginWithoutNorm).valueOf())/86400000);
         for(let i=0;i<=amountDays;i++){
            const date = calcNeededDate(req.body.dateBeginWithoutNorm,i)
            const data = await poolSutki.query(`SELECT * FROM napors WHERE date=$1`,[date]);
            allRecords.push(data.rows)
         }
         let itog=[];
         for (let i=0;i<=amountDays;i++){
            itog = [...itog,...allRecords[i]]
            }
         if(itog.length!==0){
            res.json(itog)
         }else{
            res.json("За выбранный диапазон отсутствуют данные")
         }
      }catch(err){
         res.json(err)
      };
   };
   async  deleteRecordNapor(req,res){//удаление записи Напора 
      try{       
         await poolSutki.query(`DELETE FROM napors WHERE date=$1`,[req.body.date]);
         const allRecords=[];
         let amountDays = ((new Date(req.body.dateEndWithoutNorm).valueOf()-new Date(req.body.dateBeginWithoutNorm).valueOf())/86400000);
         for(let i=0;i<=amountDays;i++){
            const date = calcNeededDate(req.body.dateBeginWithoutNorm,i)
            const data = await poolSutki.query(`SELECT * FROM napors WHERE date=$1`,[date]);
            allRecords.push(data.rows)
         }
         let itog=[];
         for (let i=0;i<=amountDays;i++){
            itog = [...itog,...allRecords[i]]
         }
         if(itog.length!==0){
            res.json(itog)
         }else{
            res.json("За выбранный диапазон дат отсутствуют данные")
         }

      }catch(err){
         res.json(err)
      };
   };
   async  getRecordRashods(req,res){//получение записи расхода, стока и выработки
      try{       
         const allRecords=[];
         let amountDays = ((new Date(req.body.dateEndDiapazone).valueOf()-new Date(req.body.dateBeginDiapazone).valueOf())/86400000);
         for(let i=0;i<=amountDays;i++){
            const date = calcNeededDate(req.body.dateBeginDiapazone,i)
            const data = await poolSutki.query(`SELECT * FROM full_rashod_stok WHERE date=$1`,[date]);
            if(data.rows.length!==0){
               allRecords.push(data.rows[0])
            }
         }
         res.json(allRecords)
      }catch(err){
         res.json(err)
      };
   };
   async  addRecordNapor(req,res){//добавление записи Напора 
      try{        
         const dataCheck = await poolSutki.query(`SELECT * FROM napors WHERE date=$1`,[req.body.date])
         if(dataCheck.rows.length!==0){
            res.json("Для выбранной даты уже существует запись. Сначала удалите старую запись, после запишите новую.")
         }else{
            await poolSutki.query(`INSERT INTO napors (date,napor1h,napor2h,napor3h,napor4h,napor5h,napor6h,napor7h,napor8h,napor9h,
               napor10h,napor11h,napor12h,napor13h,napor14h,napor15h,napor16h,napor17h,napor18h,napor19h,napor20h,napor21h,napor22h,napor23h,napor24h) 
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)`,
               [req.body.date,req.body.arr[0],req.body.arr[1],req.body.arr[2],req.body.arr[3],req.body.arr[4],req.body.arr[5],req.body.arr[6],
                req.body.arr[7],req.body.arr[8],req.body.arr[9],req.body.arr[10],req.body.arr[11],req.body.arr[12],req.body.arr[13],req.body.arr[14],
                req.body.arr[15],req.body.arr[16],req.body.arr[17],req.body.arr[18],req.body.arr[19],req.body.arr[20],req.body.arr[21],req.body.arr[22],
                req.body.arr[23]
               ]);
            const allRecords=[];
            let amountDays = ((new Date(req.body.dateEndWithoutNorm).valueOf()-new Date(req.body.dateBeginWithoutNorm).valueOf())/86400000);
            for(let i=0;i<=amountDays;i++){
               const date = calcNeededDate(req.body.dateBeginWithoutNorm,i)
               const data = await poolSutki.query(`SELECT * FROM napors WHERE date=$1`,[date]);
               allRecords.push(data.rows)
            }
            let itog=[];
            for (let i=0;i<=amountDays;i++){
               itog = [...itog,...allRecords[i]]
               }
            if(itog.length!==0){
               res.json(itog)
            }else{
               res.json("За выбранный диапазон дат отсутствуют данные")
            }
         }
      }catch(err){
         res.json(err)
      };
   };
}; 
module.exports =new adminController(); 
 