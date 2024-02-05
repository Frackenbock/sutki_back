function calcDifrencePowerAndNebalance (arrAIIS,arrPBR){
    //////// Расчёт разница между получасовками АИИС и ПБР
    let differenceAiisAndPbr = [];
    for(let i=0;i<48;i++){
        if(arrAIIS[i]===0){
            differenceAiisAndPbr.push(0);
        }else{
            differenceAiisAndPbr.push((arrAIIS[i]-arrPBR[i]).toFixed(3));
        }
        
    };
    //////// Расчёт небаланса ПБР и АИИС
    let nebalance=[];
    for(let i=0;i<48;i++){
        if(arrAIIS[i]===0){
            nebalance.push(0);
        }else{
            nebalance.push(((arrAIIS[i]-arrPBR[i])/arrPBR[i]*100).toFixed(3))
        }
    }
    return {differenceAiisAndPbr,nebalance}
}

module.exports= calcDifrencePowerAndNebalance;