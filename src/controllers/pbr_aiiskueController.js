const dataForAiisPbr = require('../data/data');// подгрузка неизменяемых данных(массивы и SQL-запросы)
const calcDifrencePowerAndNebalance = require('../utils/calcDifrencePowerAndNebalance');
const resultDataPbrAiis = require('../utils/resultDataPbrAiis');
const pg = require("pg");
const connectionTo = require('../data/connectionToDb');

const pool = new pg.Pool(connectionTo('pbr')); // подключение для запросов к БД ПБР
const poolAiis = new pg.Pool(connectionTo('aiiskue')); //подключение для запросов к БД АИИСКУЭ

class sutkiController{
//////// Функция для получения и приведения информации (страница "ПБР АИИСКУЭ", кнопка "Мощность за") 
   async getDataPower(req,res){
        try{   
            const aiisDataActive = await poolAiis.query(`
                  SELECT num_poluchas,  SUM(val_virab), COUNT(val_virab)
                  FROM virabotka_aiiskue 
                  WHERE date = $1
                  AND type_power = $2
                  AND ((num_fid=$3) OR (num_fid=$4) OR (num_fid=$5) OR (num_fid=$6) OR (num_fid=$7) OR (num_fid=$8) OR (num_fid=$9) OR (num_fid=$10))
                  GROUP BY num_poluchas
                  ORDER BY num_poluchas
            `,[req.body.date,2,'1','2','3','4','5','6','7','8'])
            let PbrUporiad = aiisDataActive.rows.sort((a,b)=>Number(a['num_poluchas'])-Number(b['num_poluchas']))
            let aiisPg = [];
            for (let i=0;i<PbrUporiad.length;i++){
                aiisPg.push([Number(PbrUporiad[i].num_poluchas),PbrUporiad[i].sum,Number(PbrUporiad[i].count)])
            }
            // Запрос в БД по информации АИИСКУЭ
            //const aiis = await connection.execute(dataForAiisPbr.sqlQueryAiis,{MM:`${req.body.date}`});
            let arr=[];

            for (let i=0; i<aiisPg.length;i++){
                for(let j=0; j<aiisPg[i].length;j++){
                    if (j===1){
                        let elem = aiisPg[i][j]*2/1000;
                        arr.push(elem);
                    };
                };
            }
            //В массиве значений АИИСКУЭ должно быть 48 значений получасовок 
            //Заполняем получасовки, который не случились нолями
            //Округляем записанные значения до трёх знаков после запятой
            let arrAIIS=[];
            for(let i=0;i<48;i++){
                if (arr[i]===undefined){
                    arrAIIS.push(0);
                }else{
                    arrAIIS.push(arr[i].toFixed(3));
                };
            };
            //////// Запрос в БД по информации ПБР
            let dateNeeded = req.body.date.slice(6,10)+'-'+req.body.date.slice(3,5)+'-'+req.body.date.slice(0,2)
            let pbrPostgres = await pool.query(`
            SELECT hour,power FROM  pbr WHERE date=$1
            ORDER BY hour`,[dateNeeded]);
            let itogPostgresPbrArr=[]
            for(let i=0; i<pbrPostgres.rows.length;i++){
              itogPostgresPbrArr.push([Number(pbrPostgres.rows[i].hour),Number(pbrPostgres.rows[i].power)])
            }
            const arrPBR = [];
            let promejut;
            for(let i=1;i<itogPostgresPbrArr.length;i++){
                for(let j=0; j<itogPostgresPbrArr[i].length;j++){
                    if (j===1){
                        promejut=(itogPostgresPbrArr[i][j]+itogPostgresPbrArr[i-1][j])/2;
                        arrPBR.push(((itogPostgresPbrArr[i-1][j]+promejut)/2).toFixed(3));
                        arrPBR.push(((itogPostgresPbrArr[i][j]+promejut)/2).toFixed(3));
                    };
                }        
            };

           //формирование массивов данных разницы мощностей и небаланса 
           const {differenceAiisAndPbr,nebalance} = calcDifrencePowerAndNebalance (arrAIIS,arrPBR);
           // формирование окончательного массива данных для отправки       
           const data = resultDataPbrAiis(dataForAiisPbr,arrAIIS,arrPBR,differenceAiisAndPbr,nebalance); 
           // формирование окончательного массива данных для отправки
           res.json({data,arrAIIS,arrPBR}) 
        }catch(er){
            console.log(er);
        }
    };
    //////// Функция для получения и приведения информации (страница "ПБР АИИСКУЭ", кнопка "Выработка за") 
    async getDataProduction(req,res){
        try{
            const aiisDataActive = await poolAiis.query(`
                  SELECT num_poluchas,  SUM(val_virab), COUNT(val_virab)
                  FROM virabotka_aiiskue 
                  WHERE date = $1
                  AND type_power = $2
                  AND ((num_fid=$3) OR (num_fid=$4) OR (num_fid=$5) OR (num_fid=$6) OR (num_fid=$7) OR (num_fid=$8) OR (num_fid=$9) OR (num_fid=$10))
                  GROUP BY num_poluchas
                  ORDER BY num_poluchas
            `,[req.body.date,2,'1','2','3','4','5','6','7','8'])
            let PbrUporiad = aiisDataActive.rows.sort((a,b)=>Number(a['num_poluchas'])-Number(b['num_poluchas']))
            let aiisPg = [];
            for (let i=0;i<PbrUporiad.length;i++){
                aiisPg.push([Number(PbrUporiad[i].num_poluchas),PbrUporiad[i].sum,Number(PbrUporiad[i].count)])
            }
            let arr=[];
            for (let i=0; i<aiisPg.length;i++){
                for(let j=0; j<aiisPg[i].length;j++){
                    if (j===1){
                        let elem = aiisPg[i][j]/1000
                        arr.push(elem.toFixed(3));
                    };
                };
            };
            //В массиве значений АИИСКУЭ должно быть 48 значений получасовок. Заполняем получасовки, который не случились, нолями
            //Округляем записанные значения до трёх знаков после запятой, получаем 
            let arrAIIS=[];
            let sumElAiis=0;
            for(let i=0;i<48;i++){
                if (arr[i]===undefined){
                    arrAIIS.push(0);
                }else{
                    sumElAiis+=Number(arr[i]);
                    arrAIIS.push(sumElAiis.toFixed(3));
                };
            };
            // Запрос в БД по информации ПБР
            let dateNeeded = req.body.date.slice(6,10)+'-'+req.body.date.slice(3,5)+'-'+req.body.date.slice(0,2)
            let pbrPostgres = await pool.query(`
            SELECT hour,power FROM  pbr WHERE date=$1
            ORDER BY hour`,[dateNeeded]);
            let itogPostgresPbrArr=[]
            for(let i=0; i<pbrPostgres.rows.length;i++){
                itogPostgresPbrArr.push([Number(pbrPostgres.rows[i].hour),Number(pbrPostgres.rows[i].power)])
            };
            const arrPBRprom = [];
            let prom;
            for(let i=1;i<itogPostgresPbrArr.length;i++){// из бд приходит массив из 25 подмассивов формата [[ 0, 70],[...]], где 0 - номер часа, 70 - значение ПБР в этот час
                for(let j=0; j<itogPostgresPbrArr[i].length;j++){
                    if (j===1){
                        prom=(itogPostgresPbrArr[i][j]+itogPostgresPbrArr[i-1][j])/2;// значение в получасовку между двумя взятыми значениями пбр (два ближайших часа) 
                        arrPBRprom.push(((itogPostgresPbrArr[i-1][j]+prom)/2).toFixed(3));
                        arrPBRprom.push(((itogPostgresPbrArr[i][j]+prom)/2).toFixed(3));
                    };
                };       
            };
            //создаём массив суммарного накопительного значения пбр
            const arrPBR = [];
            let sum=0;
            for(let i=0;i<arrPBRprom.length;i++){      
                sum+=(arrPBRprom[i])/2
                arrPBR.push(((sum)).toFixed(3));
            };
            // формирование массивов данных разницы мощностей и небаланса 
            const {differenceAiisAndPbr,nebalance} = calcDifrencePowerAndNebalance (arrAIIS,arrPBR);
            // формирование окончательного массива данных для отправки
            const data = resultDataPbrAiis(dataForAiisPbr,arrAIIS,arrPBR,differenceAiisAndPbr,nebalance); 
            // отправка данных     
            res.json({data,arrAIIS,arrPBR});
        }catch(e){
            console.log(e)
        };
    };       
};
module.exports =new sutkiController();
