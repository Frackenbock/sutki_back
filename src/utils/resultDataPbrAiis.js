const dataForAiisPbr = require('../data/data')// подгрузка неизменяемых данных(массивы и SQL-запросы)
function resultDataPbrAiis(dataForAiisPbr,arrAIIS,arrPBR,differenceAiisAndPbr,nebalance){
    
    let data = []
    for(let i=0;i<24;i++){
     data.push({
         timeBefore:dataForAiisPbr.arrTimeBefore12[i],
         pbrBefore:arrPBR[i],
         AIISBefore:arrAIIS[i],
         differenceAiisAndPbrBefore:differenceAiisAndPbr[i],
         nebalanceBefore:nebalance[i],

         timeAfter: dataForAiisPbr.arrTimeAfter12[i],
         pbrAfter:arrPBR[i+24],             
         AIISAfter:arrAIIS[i+24],
         differenceAiisAndPbrAfter:differenceAiisAndPbr[i+24],
         nebalanceAfter:nebalance[i+24]});
     };
     return data;
}

module.exports=resultDataPbrAiis 