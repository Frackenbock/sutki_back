function calcNeededDate (startDate,day){
    const dateNeeded = startDate// дата из запроса
    let dateTodayCopy = new Date(dateNeeded);
    dateTodayCopy.setDate(dateTodayCopy.getDate()+day)
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
    let date = dayTomorrow+'.'+monthTomorrow+'.'+yearTomorrow;//предшествующая дата в необходимом для запроса в БД виде
    return date
}

module.exports= calcNeededDate;