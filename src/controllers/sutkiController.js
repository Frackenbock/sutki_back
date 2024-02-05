const pg = require("pg");
const connectionTo = require('../data/connectionToDb')
const fs=require('fs')

const poolAiis = new pg.Pool(connectionTo('aiiskue'));
const pool = new pg.Pool(connectionTo('sutki'));

class sutkiController{     
   async  getData(req,res){ 
      try{
//////Запрос в PG за данными. aiisDataActive.rows - массив объектов. Объекты формата: { num_poluchas: '4', num_fid: '1', val_virab: 0 }
         const aiisDataActive = await poolAiis.query(`
               SELECT num_poluchas, num_fid, val_virab
               FROM virabotka_aiiskue 
               WHERE date = $1
               AND type_power = $2
               AND ((num_fid=$3) OR (num_fid=$4) OR (num_fid=$5) OR (num_fid=$6) OR (num_fid=$7) OR (num_fid=$8) OR (num_fid=$9) OR (num_fid=$10))
               ORDER BY num_fid, num_poluchas
         `,[req.body.date,2,'1','2','3','4','5','6','7','8'])
//////

//////Преобразование данных в массив массивов. Массивы формата: [ 4, 1, 0 ]. Также выполняется упорядочивание по номеру получасовки
          let aiisPg = [];
          for (let i=1;i<=8;i++){
             let elem=[]
             for(let j=0;j<aiisDataActive.rows.length;j++){
               if(i==Number(aiisDataActive.rows[j].num_fid)){
                   elem.push(aiisDataActive.rows[j])
               }
             }
             elem = elem.sort((a,b)=>a['num_poluchas']-b['num_poluchas'])
             for(let i=0;i<elem.length;i++){
                aiisPg.push([Number(elem[i].num_poluchas),Number(elem[i].num_fid),elem[i].val_virab])
             }
          }
//////

//////Пеобразование данных в массив(1) массивов(2) массивов(3). Производится группирование по получасовкам.
//////В массиве(1) обязательно 48 элементов
//////Каждый массив(2) либо пустой - в случае не случившейся получасовки,
//////либо состоит из 8-ми (по каждому генератору) массивов данных, формата [[ 1, 1, 0 ],[ 1, 2, 26620.2 ],[ 1, 3, 0 ], ... [ 1, 8, 0 ]]
         let dataArr = [];
         for(let k=1;k<=48;k++){
            let elem=[];
            for(let i=0;i<aiisPg.length;i++){
               if(aiisPg[i][0]==k){
                  let element = [ 
                     aiisPg[i][0],
                     aiisPg[i][1],
                     aiisPg[i][2],]
                  elem.push(element)
               }
            }
            dataArr.push(elem)
         }
//////

//////Суммирование данных за час 
         let result =[];
         for(let i=0;i<dataArr.length;i++){
            let obj={}
            if(i%2==0){//Берётся чётная получасовка
               for(let j=0;j<dataArr[i].length;j++){
                  if(dataArr[i+1][j]===undefined){//если нечётная получасовка ещё не случилась, сумма = 0
                     obj["gen"+dataArr[i][j][1]]='нет данных'
                  }else{//иначе - суммируем значения
                     obj["gen"+dataArr[i][j][1]] = String((dataArr[i][j][2]+dataArr[i+1][j][2]).toFixed(2)).replace('.',',');
                  }
               };
               result.push(obj);
            };
         };

         for(let i=0;i<24;i++){
            result[i].id=i+1;
            if(result[i].gen1===undefined&&result[i].gen2===undefined&&result[i].gen3===undefined&&result[i].gen4===undefined
               &&result[i].gen5===undefined&&result[i].gen6===undefined&&result[i].gen7===undefined&&result[i].gen8===undefined){
               result[i].gen1='нет данных';result[i].gen2='нет данных';result[i].gen3='нет данных';result[i].gen4='нет данных';
               result[i].gen5='нет данных';result[i].gen6='нет данных';result[i].gen7='нет данных';result[i].gen8='нет данных';
            };
            if(result[i].gen1===undefined){result[i].gen1='0,0'}
            if(result[i].gen2===undefined){result[i].gen2='0,0'}
            if(result[i].gen3===undefined){result[i].gen3='0,0'}
            if(result[i].gen4===undefined){result[i].gen4='0,0'}
            if(result[i].gen5===undefined){result[i].gen5='0,0'}
            if(result[i].gen6===undefined){result[i].gen6='0,0'}
            if(result[i].gen7===undefined){result[i].gen7='0,0'}
            if(result[i].gen8===undefined){result[i].gen8='0,0'}
         };
         
         let year,month,day;
         year= new Date().getFullYear();
         month = new Date().getMonth()+1;
         day = new Date().getDate();
         if(month<10){month="0"+month;}
         if(day<10){day="0"+day;}
        let date = day+'.'+month+'.'+year;
      //   let textStr = `Выгрузка произведена ${date} в ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()} с адреса ${req.ip.slice(7)} \n`
        let textBD = `Выгрузка произведена в ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()} с адреса ${req.ip.slice(7)}`
         // fs.appendFileSync(`./logs/log.txt`, textStr, function(error){if(error) throw error;});
         await pool.query(`INSERT INTO log (date, log_text) VALUES ($1,$2)`, [date,textBD])
         res.json(result)
      }catch(err){
         console.log(err)
      }
   ;}

   async  getDataRashod(req,res){ //запрос а данными интерполяции по генераторам
      try{
         if(Number(req.body.genNum)===1){
            const dataIntPOst = await pool.query(`
            SELECT * FROM interpolation_ga_1 
            WHERE (N = $1 AND P = $3) OR (N = $2 AND P = $3) OR (N = $1 AND P = $4) OR (N = $2 AND P = $4)
            ORDER BY P, N`, 
            [req.body.N1,req.body.N2,req.body.P1,req.body.P2]);

            let itogData=[];
            for(let  i=0; i<dataIntPOst.rows.length;i++){
               itogData.push([Number((dataIntPOst.rows[i].p).replace(",",".")),
               Number((dataIntPOst.rows[i].n).replace(",",".")),
               Number((dataIntPOst.rows[i].q).replace(",","."))])
            }
            res.json(itogData)
         };
         if(Number(req.body.genNum)===2){
            const dataIntPOst = await pool.query(`
            SELECT * FROM interpolation_ga_2 
            WHERE (N = $1 AND P = $3) OR (N = $2 AND P = $3) OR (N = $1 AND P = $4) OR (N = $2 AND P = $4)
            ORDER BY P, N`, 
            [req.body.N1,req.body.N2,req.body.P1,req.body.P2]);
            let itogData=[];
            console.log(dataIntPOst.rows)
            for(let  i=0; i<dataIntPOst.rows.length;i++){
               itogData.push([Number((dataIntPOst.rows[i].p).replace(",",".")),
               Number((dataIntPOst.rows[i].n).replace(",",".")),
               Number((dataIntPOst.rows[i].q).replace(",","."))])
            }
            res.json(itogData)
         };
         if(Number(req.body.genNum)===3){
            const dataIntPOst = await pool.query(`
            SELECT * FROM interpolation_ga_3 
            WHERE (N = $1 AND P = $3) OR (N = $2 AND P = $3) OR (N = $1 AND P = $4) OR (N = $2 AND P = $4)
            ORDER BY P, N`, 
            [req.body.N1,req.body.N2,req.body.P1,req.body.P2]);
            let itogData=[];
            for(let  i=0; i<dataIntPOst.rows.length;i++){
               itogData.push([Number((dataIntPOst.rows[i].p).replace(",",".")),
               Number((dataIntPOst.rows[i].n).replace(",",".")),
               Number((dataIntPOst.rows[i].q).replace(",","."))])
            }
            res.json(itogData)
         };
         if(Number(req.body.genNum)===4){
            const dataIntPOst = await pool.query(`
            SELECT * FROM interpolation_ga_4 
            WHERE (N = $1 AND P = $3) OR (N = $2 AND P = $3) OR (N = $1 AND P = $4) OR (N = $2 AND P = $4)
            ORDER BY P, N`, 
            [req.body.N1,req.body.N2,req.body.P1,req.body.P2]);

            let itogData=[];
            for(let  i=0; i<dataIntPOst.rows.length;i++){
               itogData.push([Number((dataIntPOst.rows[i].p).replace(",",".")),
               Number((dataIntPOst.rows[i].n).replace(",",".")),
               Number((dataIntPOst.rows[i].q).replace(",","."))])
            }
            res.json(itogData)
         };
         if(Number(req.body.genNum)===5){
            const dataIntPOst = await pool.query(`
            SELECT * FROM interpolation_ga_5 
            WHERE (N = $1 AND P = $3) OR (N = $2 AND P = $3) OR (N = $1 AND P = $4) OR (N = $2 AND P = $4)
            ORDER BY P, N`, 
            [req.body.N1,req.body.N2,req.body.P1,req.body.P2]);

            let itogData=[];
            for(let  i=0; i<dataIntPOst.rows.length;i++){
               itogData.push([Number((dataIntPOst.rows[i].p).replace(",",".")),
               Number((dataIntPOst.rows[i].n).replace(",",".")),
               Number((dataIntPOst.rows[i].q).replace(",","."))])
            }
            res.json(itogData)
         };
         if(Number(req.body.genNum)===6){
            const dataIntPOst = await pool.query(`
            SELECT * FROM interpolation_ga_6 
            WHERE (N = $1 AND P = $3) OR (N = $2 AND P = $3) OR (N = $1 AND P = $4) OR (N = $2 AND P = $4)
            ORDER BY P, N`, 
            [req.body.N1,req.body.N2,req.body.P1,req.body.P2]);
            let itogData=[];
            for(let  i=0; i<dataIntPOst.rows.length;i++){
               itogData.push([Number((dataIntPOst.rows[i].p).replace(",",".")),
               Number((dataIntPOst.rows[i].n).replace(",",".")),
               Number((dataIntPOst.rows[i].q).replace(",","."))])
            }
            res.json(itogData)
         };
         if(Number(req.body.genNum)===7){
            const dataIntPOst = await pool.query(`
            SELECT * FROM interpolation_ga_7
            WHERE (N = $1 AND P = $3) OR (N = $2 AND P = $3) OR (N = $1 AND P = $4) OR (N = $2 AND P = $4)
            ORDER BY P, N`, 
            [req.body.N1,req.body.N2,req.body.P1,req.body.P2]);

            let itogData=[];
            for(let  i=0; i<dataIntPOst.rows.length;i++){
               itogData.push([Number((dataIntPOst.rows[i].p).replace(",",".")),
               Number((dataIntPOst.rows[i].n).replace(",",".")),
               Number((dataIntPOst.rows[i].q).replace(",","."))])
            }
            res.json(itogData)
         };
         if(Number(req.body.genNum)===8){
            const dataIntPOst = await pool.query(`
            SELECT * FROM interpolation_ga_8 
            WHERE (N = $1 AND P = $3) OR (N = $2 AND P = $3) OR (N = $1 AND P = $4) OR (N = $2 AND P = $4)
            ORDER BY P, N`, 
            [req.body.N1,req.body.N2,req.body.P1,req.body.P2]);

            let itogData=[];
            for(let  i=0; i<dataIntPOst.rows.length;i++){
               itogData.push([Number((dataIntPOst.rows[i].p).replace(",",".")),
               Number((dataIntPOst.rows[i].n).replace(",",".")),
               Number((dataIntPOst.rows[i].q).replace(",","."))])
            }
            res.json(itogData)
         };  
      }catch(err){
         console.log(err);
      };
   };
   async  getDataTime(req,res){  // запрос в бд за временем работы генераторов и напорами
       try{
         const dataNapors = await pool.query(`SELECT * FROM napors WHERE date=$1`,[req.body.date]);
         const dataTimes = await pool.query(`SELECT * FROM times WHERE date=$1`,[req.body.date]);
         res.json({dataTimes:dataTimes.rows,dataNapors:dataNapors.rows,});//dataTimesO:data.rows
       }catch(err){
          console.log(err);
       };
     };  
};

module.exports =new sutkiController();
