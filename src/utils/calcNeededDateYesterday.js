function normalizeDateYesterday(data){
    let day = new Date(data.slice(3,5)+'.'+data.slice(0,2)+'.'+data.slice(6,10)).valueOf()
    let dateTodayCopy;
    let dayInMillyseconds = 24*60*60*1000;
    dateTodayCopy = new Date(day-dayInMillyseconds)
    let yearTomorrow,monthTomorrow,dayTomorrow;
    yearTomorrow= dateTodayCopy.getFullYear();
    monthTomorrow = dateTodayCopy.getMonth()+1;
    dayTomorrow = dateTodayCopy.getDate();
    if(monthTomorrow<10){
       monthTomorrow="0"+monthTomorrow;
    }
    if(dayTomorrow<10){
       dayTomorrow="0"+dayTomorrow;
    }
    let dateTire = yearTomorrow+'-'+monthTomorrow+'-'+dayTomorrow ;//предшествующая дата в необходимом для запроса в БД виде
    let dateDotted = dayTomorrow+'.'+monthTomorrow+'.'+yearTomorrow ;//предшествующая дата в необходимом для запроса в БД виде
    return {dateTire,dateDotted}
}
module.exports= normalizeDateYesterday;