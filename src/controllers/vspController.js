const calcNeededDate  = require('../utils/calcNeededDate')
const pg = require("pg");
const connectionTo = require('../data/connectionToDb');
 const pool = new pg.Pool(connectionTo('vspdata')); 
 const arrIp = [
            "10.18.100.63",
            "10.18.100.46",
            "10.18.2.144",
            "10.18.2.36",// Рыжов          
            "10.18.100.60",
            "10.18.100.71",
            "10.18.100.36",
			   "10.18.100.167",
            "10.18.100.23",//Краличев
            "10.18.2.222",// Омельянюк 
         ]    
 
class vspController{
   async  getDataMagazineInterpol(req,res){//получение конкретных данных для расчёта интерполяции расхода через ВСП для страницы расчёт расхода через  ВСП 
      if(arrIp.includes((req.ip).slice(7))){ 
         try{
            if(Number(req.body.prolet)>=1&&Number(req.body.prolet)<=10){
               const data_nap_1 = await pool.query(`SELECT * FROM interpol_bays_from_1_to_10 WHERE ubv=$1`,[req.body.ubv_1]);
               const data_nap_2 = await pool.query(`SELECT * FROM interpol_bays_from_1_to_10 WHERE ubv=$1`,[req.body.ubv_2]);
               const dataToFront = {
                  data_nap_1: data_nap_1.rows, 
                  data_nap_2: data_nap_2.rows,
               }  
               res.json(dataToFront) 
            }else{
               const pool = new pg.Pool(configForVSP);
                  const data_nap_1 = await pool.query(`SELECT * FROM interpol_bays_from_11_12 WHERE ubv=$1`,[req.body.ubv_1]);
                  const data_nap_2 = await pool.query(`SELECT * FROM interpol_bays_from_11_12 WHERE ubv=$1`, [req.body.ubv_2]);
               const dataToFront = { 
                  data_nap_1: data_nap_1.rows, 
                  data_nap_2: data_nap_2.rows,
               };
               res.json(dataToFront)
            };
         }catch(err){
            console.log(err) 
            res.json('Ошибка чтения данных для интерполяции')
         }; 
      }else{
         res.json('У Вас нет прав создания записией журнала')
      }
   };
   async  setDataRecordMagazine(req,res){//запись в бД данных о новой записи для журнала пролётов
         try{
            const time_open=`${req.body.openTimeHours}:${req.body.openTimeMinutes}`;
            const time_close =`${req.body.closeTimeHours}:${req.body.closeTimeMinutes}`;

            const data = await pool.query(`
            SELECT * FROM magazine_records WHERE date = $1 AND prolet = $2`,
            [req.body.openDate,req.body.prolet])

            if(data.rows.length===1){
            const errorMesssage = `Пролёт ${req.body.prolet} за ${req.body.openDate} открыт с ${data.rows[0].open_time} по ${data.rows[0].close_time}.
            В просимой записи с ${req.body.openTimeHours}:${req.body.openTimeMinutes} по ${req.body.closeTimeHours}:${req.body.closeTimeMinutes}`
            
                const hours_open_BD=data.rows[0].open_time.slice(0,2);
                const minutes_open_BD=data.rows[0].open_time.slice(3,5);
                const hours_close_BD=data.rows[0].close_time.slice(0,2);
                const minutes_close_BD =data.rows[0].close_time.slice(3,5);
               //если в бд уже есть запись 00:00 - 24:00, туда ничего нельзя записать(любой запрос)
               if(Number(hours_close_BD)===24&&Number(minutes_close_BD)===0&&Number(hours_open_BD)===0&&Number(minutes_open_BD)===0){
                  return res.json(`Ошибка. ${errorMesssage}`)
               }
               //если в бд уже есть запись(любая), а запрос содержит  00:00 - 24:00, туда ничего нельзя записать
               if(Number(req.body.closeTimeHours)===24&&Number(req.body.closeTimeMinutes)===0
                  &&Number(req.body.openTimeHours)===0&&Number(req.body.openTimeMinutes)===0){
                     return res.json(`Ошибка. ${errorMesssage}`)
               }
               //если в бд уже есть запись 00:00 - чч:мм
               if((Number(hours_open_BD)===0&&Number(minutes_open_BD)===0)&&(Number(hours_close_BD)!==24||Number(minutes_close_BD)!==0)){
                  //если час открытия в запросе меньше часа закрытия из БД
                  if(Number(req.body.openTimeHours)<Number(hours_close_BD)){
                     return res.json(`Ошибка. ${errorMesssage}`)
                  }
                  //если час открытия в запросе равен часу закрытия из БД
                  if(Number(req.body.openTimeHours)===Number(hours_close_BD)){
                     //если минуты открытия в запросе меньше минут  часу закрытия из БД
                     if(Number(req.body.openTimeMinutes)<Number(minutes_close_BD)){
                        return res.json(`Ошибка. ${errorMesssage}`)
                     }
                  }
               }
               //если в бд уже есть запись чч:мм - 24:00
               if((((Number(hours_open_BD)!==0||Number(minutes_open_BD)!==0))||
                   ((Number(hours_open_BD)!==0&&Number(minutes_open_BD)!==0)))&&
                   (Number(hours_close_BD)===24&&Number(minutes_close_BD)===0)){
                   //если час закрытия в запросе больше часа открытия из БД
                  if(Number(req.body.closeTimeHours)>Number(hours_open_BD)){
                     return res.json(`Ошибка. ${errorMesssage}`)
                  }
                   //если час закрытия в запросе равен часу открытия из БД
                  if(Number(req.body.closeTimeHours)===Number(hours_open_BD)){
                     //если минуты закрытия в запросе больше минут открытия из БД
                     if(Number(req.body.closeTimeMinutes)>Number(minutes_open_BD)){
                        return res.json(`Ошибка. ${errorMesssage}`)
                     }
                  }
               }  
              //если в бд уже есть запись чч:мм - чч:мм (оч плохо)
              if((((Number(hours_open_BD)!==0||Number(minutes_open_BD)!==0))||
                  ((Number(hours_open_BD)!==0&&Number(minutes_open_BD)!==0)))&&
                  ((Number(hours_close_BD)!==24||Number(minutes_close_BD)!==0)||
                  (Number(hours_close_BD)!==24&&Number(minutes_close_BD)!==0))){
                  //если в запросе  00:00 - чч:мм 
                  if((Number(req.body.closeTimeHours)!==24||Number(req.body.closeTimeMinutes)!==0)
                     &&(Number(req.body.openTimeHours)===0&&Number(req.body.openTimeMinutes)===0)){
                        //если час закрытия в запросе больше часа открытия в БД
                        if(Number(req.body.closeTimeHours>Number(hours_open_BD))){
                           return res.json(`Ошибка. ${errorMesssage}`)
                        }
                        //если час закрытия в запросе равен часу открытия в БД
                        if(Number(req.body.closeTimeHours = Number(hours_open_BD))){
                           //если минуты закрытия из запроса больше минут открытия из БД
                           if(Number(req.body.closeTimeMinutes)>Number(minutes_open_BD)){
                              return res.json(`Ошибка. ${errorMesssage}`)
                           }
                        }
                  }
                  //если в запросе  чч:мм - 24:00 
                  if((Number(req.body.closeTimeHours)===24&&Number(req.body.closeTimeMinutes)===0)
                  &&(Number(req.body.openTimeHours)!==0||Number(req.body.openTimeMinutes)!==0)){
                     //если час открытия из запроса меньше часа закрытия из БД
                     if(Number(req.body.openTimeHours)<Number(hours_close_BD)){
                        return res.json(`Ошибка. ${errorMesssage}`)
                     };
                     //если час открытия из запроса равен часу закрытия из БД
                     if(Number(req.body.openTimeHours)===Number(hours_close_BD)){
                        //если минуты открытия из запроса меньше минут закрытия из БД
                        if(Number(req.body.openTimeMinutes)<Number(minutes_close_BD)){
                           return res.json(`Ошибка. ${errorMesssage}`)
                        };
                     };
                  };
                  //если в запросе  чч:мм - чч:мм (оч оч плохо)
                  if ((((Number(req.body.openTimeHours)!==0||Number(req.body.openTimeMinutes)!==0))||
                  ((Number(req.body.openTimeHours)!==0&&Number(req.body.openTimeMinutes)!==0)))&&
                  ((Number(req.body.closeTimeHours)!==24||Number(req.body.closeTimeMinutes)!==0)||
                  (Number(req.body.closeTimeHours)!==24&&Number(req.body.closeTimeMinutes)!==0))){
                     //час закрытия из запроса больше часа открытия из БД
                     if(Number(req.body.closeTimeHours)>Number(hours_open_BD)){
                        //час открытия в запросе меньше часа закрытия бд (иначе это лигитимная запись)
                        if((Number(req.body.openTimeHours)<Number(hours_close_BD))){
                           return res.json(`Ошибка. ${errorMesssage}`)
                        }
                        //час открытия в запросе равен часу закрытия бд
                        if(Number(req.body.openTimeHours)===Number(hours_close_BD)){
                           //минуты открытия в запросе меньше минут закрытия в БД
                           if(Number(req.body.openTimeMinutes)<Number(minutes_close_BD)){
                              return res.json(`Ошибка. ${errorMesssage}`)
                           };
                        };
                     };
                     //час закрытия из запроса равен часу открытия из БД
                     if(Number(req.body.closeTimeHours)===Number(hours_open_BD)){
                        //если минуты закрытия из запроса больше минут закрытия из БД
                        if(Number(req.body.closeTimeMinutes)>Number(minutes_open_BD)){
                           return res.json(`Ошибка. ${errorMesssage}`)
                        };
                     };
                     //час закрытия из БД больше часа открытия из запроса
                     if(Number(hours_close_BD)>Number(req.body.openTimeHours)){
                        //час закрытия из запроса больше часа открытия из БД
                        if(Number(req.body.closeTimeHours)>Number(hours_open_BD)){
                           return res.json(`Ошибка. ${errorMesssage}`)
                        }
                        //час закрытия из запроса равен часу открытия из БД
                        if(Number(req.body.closeTimeHours)===Number(hours_open_BD)){
                           //минуты открытия в запросе меньше минут закрытия в БД
                           if(Number(req.body.closeTimeMinutes)<Number(minutes_open_BD)){
                              return res.json(`Ошибка. ${errorMesssage}`)
                           };
                        }
                     };
                     //час закрытия из БД равен часу открытия из запроса
                     if(Number(hours_close_BD)===Number(req.body.openTimeHours)){
                        //если минуты закрытия из БД больше минут открытия из запроса
                        if(Number(minutes_close_BD)>Number(req.body.opemTimeMinutes)){
                           return res.json(`Ошибка. ${errorMesssage}`)
                        };
                     };
                  };
              }
            };

            if(data.rows.length>1&&req.body.flag===false){
               return res.json({record:req.body,
               message:`За ${req.body.openDate} для пролёта №${req.body.prolet} существует более двух записей. 
               Проверьте данные введённых времени открытия и времени закрытия:`})
            }

            await pool.query(`
            INSERT INTO magazine_records (id,date,prolet,type_open,
               open_time, close_time, time_work, ubv, rashod_mgn,rashod_srd, stok)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
            [req.body.id, req.body.openDate, req.body.prolet, req.body.typeOpen,
            time_open, time_close,req.body.workTime, req.body.ubv, req.body.rashodM, 
            req.body.rashodS, req.body.stok])

            const dataHoursVsp = await pool.query(`
            SELECT * FROM hours_uvb_for_vsp WHERE date = $1`,
            [req.body.openDate])
            if(dataHoursVsp.rows.length===0){
               await pool.query(`
               INSERT INTO hours_uvb_for_vsp (date, uvb_1, uvb_2, uvb_3, uvb_4, uvb_5, uvb_6, uvb_7, uvb_8, uvb_9, uvb_10, uvb_11,
                  uvb_12, uvb_13, uvb_14, uvb_15, uvb_16, uvb_17, uvb_18, uvb_19, uvb_20, uvb_21, uvb_22, uvb_23, uvb_24, id)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26)`,
               [req.body.openDate,req.body.ubvObjectArr[0].ubv,req.body.ubvObjectArr[1].ubv,req.body.ubvObjectArr[2].ubv,
               req.body.ubvObjectArr[3].ubv,req.body.ubvObjectArr[4].ubv,req.body.ubvObjectArr[5].ubv,req.body.ubvObjectArr[6].ubv,
               req.body.ubvObjectArr[7].ubv,req.body.ubvObjectArr[8].ubv,req.body.ubvObjectArr[9].ubv,req.body.ubvObjectArr[10].ubv,
               req.body.ubvObjectArr[11].ubv,req.body.ubvObjectArr[12].ubv,req.body.ubvObjectArr[13].ubv,req.body.ubvObjectArr[14].ubv,
               req.body.ubvObjectArr[15].ubv,req.body.ubvObjectArr[16].ubv,req.body.ubvObjectArr[17].ubv,req.body.ubvObjectArr[18].ubv,
               req.body.ubvObjectArr[19].ubv,req.body.ubvObjectArr[20].ubv,req.body.ubvObjectArr[21].ubv,req.body.ubvObjectArr[22].ubv,
               req.body.ubvObjectArr[23].ubv,req.body.id])
            }
            const allRecords=[];
            let amountDays = ((new Date(req.body.dateEndWithoutNorm).valueOf()-new Date(req.body.dateBeginWithoutNorm).valueOf())/86400000);
            for(let i=0;i<=amountDays;i++){
               const date = calcNeededDate(req.body.dateBeginWithoutNorm,i)
               const data = await pool.query(`SELECT * FROM magazine_records WHERE date=$1`,[date]);
               allRecords.push(data.rows)
            }
            let itog=[];
            for (let i=0;i<=amountDays;i++){
               itog = [...itog,...allRecords[i]]}
            res.json(itog);

         }catch(err){
            console.log(err) 
            res.json('Ошибка создания новой записи',err)
         };
   };
   async  getDataForRashod(req,res){ //получение данных для расчёта интерполяции расхода через ВСП для страницы расчёт расхода
      try{
            const data_nap_1 = await pool.query(`SELECT * FROM interpol_bays_from_1_to_10 WHERE ubv=$1`,[req.body.ubv_1]);
            const data_nap_2 = await pool.query(`SELECT * FROM interpol_bays_from_1_to_10 WHERE ubv=$1`,[req.body.ubv_2]);
            const data_nap_3 = await pool.query(`SELECT * FROM interpol_bays_from_11_12 WHERE ubv=$1`,[req.body.ubv_1]);
            const data_nap_4 = await pool.query(`SELECT * FROM interpol_bays_from_11_12 WHERE ubv=$1`, [req.body.ubv_2]);
         const dataToFront = {
            data_nap_1: data_nap_1.rows,
            data_nap_2: data_nap_2.rows,
            data_nap_3: data_nap_3.rows,
            data_nap_4: data_nap_4.rows,
         };
         res.json(dataToFront)
      }catch(err){
         console.log(err)
      };
   };
   async  getMagazineRecords(req,res){//получение из БД данных за определённые диапазон дат для журнала открытий и закрытий пролётов ВСП 
      try{            
         const allRecords=[];
         let amountDays = ((new Date(req.body.dateEndWithoutNorm).valueOf()-new Date(req.body.dateBeginWithoutNorm).valueOf())/86400000);
         for(let i=0;i<=amountDays;i++){
            const date = calcNeededDate(req.body.dateBeginWithoutNorm,i)
            const data = await pool.query(`SELECT * FROM magazine_records WHERE date=$1`,[date]);
            allRecords.push(data.rows)
         }
         let itog=[];
         for (let i=0;i<=amountDays;i++){
            itog = [...itog,...allRecords[i]]
            }
         res.json(itog)
      }catch(err){
         res.json("Ошибка чтения данных из БД для журнала открытий и закрытий пролётов ВСП - ",err)
         console.log(err)
      };
   };
   async  setEditedMagazineRecord(req,res){//запись отредактированной записидля журнала открытий и закрытий 
      try{                     
         const time_open=`${req.body.openTimeHours}:${req.body.openTimeMinutes}`;
         const time_close =`${req.body.closeTimeHours}:${req.body.closeTimeMinutes}`;

         await pool.query(`DELETE FROM magazine_records WHERE id=$1`,[req.body.id])
         await pool.query(`
         INSERT INTO magazine_records (id,date,prolet,type_open,
            open_time, close_time, time_work, ubv, rashod_mgn,rashod_srd, stok)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
         [req.body.id, req.body.openDate, req.body.prolet, req.body.typeOpen,
         time_open, time_close,req.body.workTime, req.body.ubv, req.body.rashodM, 
         req.body.rashodS, req.body.stok])
         
         const allRecords=[];
          let amountDays = ((new Date(req.body.dateEndWithoutNorm).valueOf()-new Date(req.body.dateBeginWithoutNorm).valueOf())/86400000);
            for(let i=0;i<=amountDays;i++){
               const date = calcNeededDate(req.body.dateBeginWithoutNorm,i)
               const data = await pool.query(`SELECT * FROM magazine_records WHERE date=$1`,[date]);
               allRecords.push(data.rows)
            }
            let itog=[];
            for (let i=0;i<=amountDays;i++){
               itog = [...itog,...allRecords[i]]
            } 
         res.json(itog)
      }catch(err){
         res.json(err)
      };
   };
   async  deleteMagazineRecord(req,res){//удаление записи из журнала отрытий и закытий пролётов ВСП
      try{            
         await pool.query(`DELETE FROM magazine_records WHERE id=$1`,[req.body.id])
         const allRecords=[];
          let amountDays = ((new Date(req.body.dateEndWithoutNorm).valueOf()-new Date(req.body.dateBeginWithoutNorm).valueOf())/86400000);
            for(let i=0;i<=amountDays;i++){
               const date = calcNeededDate(req.body.dateBeginWithoutNorm,i)
               const data = await pool.query(`SELECT * FROM magazine_records WHERE date=$1`,[date]);
               allRecords.push(data.rows)
            }
            let itog=[];
            for (let i=0;i<=amountDays;i++){
               itog = [...itog,...allRecords[i]]
            }
         res.json(itog)
      }catch(err){
         console.log(err)
      };
   };
   async  getDataForHoursRecord(req,res){//получение данных для расчёта почасовых значений расхода через ВСП за сутки 
      try{        
         const dataRecords = await pool.query(`SELECT * FROM magazine_records WHERE date=$1`,[req.body.date]);
         const dataUVB = await pool.query(`SELECT * FROM hours_uvb_for_vsp WHERE date=$1`,[req.body.date]);
         if(dataUVB.rows.length!==0&&dataRecords.rows.length===0){
            res.json('За выбранную дату отсутствуют записи в журнале открытий и закрытий пролётов')
         }else if(dataUVB.rows.length===0&&dataRecords.rows.length!==0){
            res.json('За выбранную дату отсутствуют данные УВБ ')
         }else if(dataUVB.rows.length===0&&dataRecords.rows.length===0){
            res.json('За выбранную дату отсутствуют данные УВБ и записи в журнале открытий и закрытий пролётов')
         }else if(dataUVB.rows.length!==0&&dataRecords.rows.length!==0){
            res.json({dataRecords:dataRecords.rows,dataUVB:dataUVB.rows}) 
         }
      }catch(err){
         res.json(err)
      };
   };
   async  getAllInterpolationData(req,res){//получение всех данных интерполяции для расчёта почасовых значений расхода через ВСП за сутки 
      try{        
         const dataFor1_10 = await pool.query(`SELECT * FROM interpol_bays_from_1_to_10`);
         const dataFor11_12 = await pool.query(`SELECT * FROM interpol_bays_from_11_12`);
         res.json({dataFor1_10:dataFor1_10.rows,dataFor11_12:dataFor11_12.rows})
      }catch(err){
         res.json(err)
      };
   };
   async  getDataForMagazineRecord(req,res){//получение данных УВБ для расчёта верхнего бьефа в записи журнала 
      try{        
         const dataUVB = await pool.query(`SELECT * FROM hours_uvb_for_vsp WHERE date=$1`,[req.body.date]);
         if(dataUVB.rows.length===0){
            res.json(`За ${req.body.date} отсутствуют данные УВБ. Сначала сохраните значения верхнего бьефа на странице "Просмотр и корректирование данных часовых УВБ"`)
         }else {
            res.json(dataUVB.rows) 
         }
      }catch(err){
         res.json(err)
      };
   };
}; 
module.exports =new vspController(); 
 