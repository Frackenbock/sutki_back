function connectionToPG (nameBD){
    return (
        {   user:'postgres',
            password:'postgres',
            port:5432,
            host:'10.18.199.4',
            database:`${nameBD}`
         }
    )
}
module.exports = connectionToPG