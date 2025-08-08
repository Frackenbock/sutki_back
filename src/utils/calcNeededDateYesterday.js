function normalizeDateYesterday(data){
    const dateNeeded = data// дата из запроса
    let dateTodayCopy = new Date(dateNeeded);

    dateTodayCopy.setDate(dateTodayCopy.getDate()-1)
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

    let date = yearTomorrow+'-'+monthTomorrow+'-'+dayTomorrow ;//предшествующая дата в необходимом для запроса в БД виде
    return date
}
module.exports= normalizeDateYesterday;