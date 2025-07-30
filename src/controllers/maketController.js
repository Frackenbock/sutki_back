const nodemailer = require("nodemailer");
const fs = require("fs");
const pg = require("pg")
const connectionTo = require('../data/connectionToDb');

const poolMaket = new pg.Pool(connectionTo('maket17'));
const poolSutki = new pg.Pool(connectionTo('sutki')); 
const poolAiis = new pg.Pool(connectionTo('aiiskue'));

const arrIp = ["10.18.2.36","10.18.100.63","10.18.100.46","10.18.2.144",
			   "10.18.2.222","10.18.100.60","10.18.100.71","10.18.100.36",
			   "10.18.100.167","10.18.100.23"]                               //список разрешённых ip-адресов, с которых можно отправлять макет

class maketController{
   async sendMaketData(req,res){//отправка макета
		if(arrIp.includes((req.ip).slice(7))){//
		  const dateForTitle =  `4-NIGES 017 (${req.body.normalDate.slice(0,2)+req.body.normalDate.slice(3,5)+req.body.normalDate.slice(8,10)})`

		  const record = await poolMaket.query(`SELECT * FROM emails`);// Запрос за aдресами получателей в БД
		  let adresses = [];
		  if((req.ip).slice(7)!=="10.18.2.36"){
		    for(let i=0;i<record.rows.length;i++){ 
		    	   adresses.push(record.rows[i].email);
		    }; 

		 }else{
		    adresses.push("ryzhovas@rushydro.ru");
		  }	
		  let passwPost = await poolMaket.query(`SELECT * FROM params WHERE name = $1`, ['Пароль']);// Запрос паролем учётки для постового сервера в БД
		  passwPost = passwPost.rows[0].value
		  
		  let ipPost = await poolMaket.query(`SELECT * FROM params WHERE name = $1`, ['IP-адрес']);// Запрос за айпишником почтового сервера в БД
		  ipPost=ipPost.rows[0].value

		  let namePost = await poolMaket.query(`SELECT * FROM params WHERE name = $1`, ['Имя']);// Запрос за именем учётки в БД
		  namePost=namePost.rows[0].value
		  
		  let toWrite = 
			 `//017:${req.body.normalDate.slice(3,5)}${req.body.normalDate.slice(0,2)}:310330:++`
			+`\n (3):  ${String(req.body.shifr)} :`
			+`\n (4):  ${String(req.body.windSpeed)} :`
			+`\n (10): ${String(req.body.upPoolAvearageThisDay)} :`
			+`\n (14): ${String(req.body.upPoolThisDay)} :`
			+`\n (16): ${String(req.body.downPoolThisDay)} :`
			+`\n (18): ${String(req.body.downPoolAvearageLastDay)} :`
			+`\n (19): ${String(req.body.downPoolMax)} :`
			+`\n (20): ${String(req.body.downPoolMin)} :`
			+`\n (30): ${String(req.body.rushAverage)} :`
			+`\n (40): ${String(req.body.fullInflow)} :`
			+`\n (41): ${String(req.body.lateralInflow)} :`
			+`\n (45): ${String(req.body.totalFlowInDownPool)} :`
			+`\n (46): ${String(req.body.flowInTurbines)} :`
			+`\n (47): ${String(req.body.spillwayFlow)} :`
			+`\n (48): ${String(req.body.idlingFlow)} :`
			+`\n (49): ${String(req.body.filtrationFlow)} :`
			+`\n (50): ${String(req.body.lockingFlow)} :`
			+`\n (60): ${String(req.body.maxLoad)} :`
			+`\n (61): ${String(req.body.minLoad)} :`
			+`\n (62): ${String(req.body.operatingUnits)} :`
			+`\n (63): ${String(req.body.unitsUnderRepair)} :`
			+`\n (64): ${String(req.body.totalPowerInRepair)} :`
			+`\n (65): ${String(req.body.dailyOutput)} :`
			+`\n (66): ${String(req.body.monthOutput)} : ==`
 
			try{
			fs.writeFile(`./maket_archive/@m_017_${req.body.normalDate.slice(0,2)}.txt`,toWrite, function(error){
				if(error) throw error;
			});
		
			let transporter = nodemailer.createTransport({
				host: ipPost,
				port: 25,
				auth: {
				  user: namePost,
				  pass: passwPost,
				},
				tls:{
					rejectUnauthorized: false
			   }
			  })
			
			  let mailOptions = {
				from: namePost,
				bcc: adresses,
				//bcc: "ryzhovas@rushydro.ru",
				subject: dateForTitle,
				text: '',
				attachments: [
					{ filename: `@m_017_${req.body.normalDate.slice(0,2)}.txt`,
					  path: `/home/sutki/sutki_project/backend_sutki/maket_archive/@m_017_${req.body.normalDate.slice(0,2)}.txt` },],
			  };
			  transporter.sendMail(mailOptions, function(error, info){
				if (error) {
				  console.log(error);
				  res.json(error)
				} else {
				  console.log('Email sent: ' + info.response);
				  res.json("Макет успешно отправлен")
				}
			  });
		  }catch(err){
			 res.json(err)
		  };
		}else{
			res.json("У Вас нет прав для отправки макета")
		}
   };
   
   async saveMaketData(req,res){//сохранение данных макета в БД
	  if(arrIp.includes((req.ip).slice(7))){
		  try{		 
			 const oldData = await poolMaket.query(`SELECT * FROM maket17 WHERE date = $1`,[req.body.date])
			 if(oldData.rows.length>0){
				 await poolMaket.query(`DELETE FROM maket17 WHERE date = $1`,[req.body.date])
			 }
			 
			 const newRecord = await poolMaket.query(`
			 INSERT INTO maket17 
			 (date,scorost_vetra_8_00,napravlenie_vetra_8_00,v_bief_sr,v_bief_8_00,n_bief_8_00,
			 n_bief_sr_old,n_bief_max,n_bief_min,napor_sr_sutki,polni_pritok,bokovoi_pritok,
			 rashod_sum_n_bief,rashod_turbin,rashod_vodosbros,rashod_holost_hod,
			 rashod_filtr,rashod_shluz,max_nagr_ges,min_nagr_ges,kolvo_rab_agr,
			 agr_rem,sum_moshn_v_rem,sum_virabotka,virabotka_s_nach_mes,sobstv_sut_potr,sobstv_potr_nach_mes)

			 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27)`,
			 [req.body.date,//date
			  req.body.windSpeed,//4-scorost_vetra_8_00
			  req.body.shifr,//3-napravlenie_vetra_8_00
			  req.body.upPoolAvearageThisDay,//10_v_bief_sr
			  req.body.upPoolThisDay,//14-v_bief_8_00
			  req.body.downPoolThisDay,//16-n_bief_8_00
			  req.body.downPoolAvearageLastDay,//18-n_bief_sr_old
			  req.body.downPoolMax,//19-n_bief_max
			  req.body.downPoolMin,//20-n_bief_min
			  req.body.rushAverage,//30-napor_sr_sutki
			  req.body.fullInflow,//40-polni_pritok
			  req.body.lateralInflow,// 41-bokovoi_pritok
			  req.body.totalFlowInDownPool,// 45-rashod_sum_n_bief
			  req.body.flowInTurbines,//46-rashod_turbin
			  req.body.spillwayFlow,//47-rashod_vodosbros
			  req.body.idlingFlow,//48-rashod_holost_hod
			  req.body.filtrationFlow,//49-rashod_filtr
			  req.body.lockingFlow,//50-rashod_shluz
			  req.body.maxLoad,//60-max_nagr_ges
			  req.body.minLoad,//61-min_nagr_ges
			  req.body.operatingUnits,//62-kolvo-rab-agr
			  req.body.unitsUnderRepair,// 63-agr_rem
			  req.body.totalPowerInRepair,// 64-sum_moshn_v_rem
			  req.body.dailyOutput,//65-sum_virabotka
			  req.body.monthOutput,//66-virabotka_s_nach_mes
			  req.body.sobstSutPotr,//sobstv_sut_potr
			  req.body.sobstSutPotrNachMes,//sobstSutPotrNachMes
			])
			res.json("Данные успешно записаны в БД")

		  }catch(err){
			 res.json(err)
		  }
		}else{
			res.json("У Вас нет прав для записи данных макета")
		}
   };
   
   async getMaketData(req,res){//получение данных макета за определённую дату 
      try{
         const newRecord = await poolMaket.query(`
            SELECT * FROM maket17
            WHERE date = $1
         `,[req.body.date])
         res.json(newRecord.rows)
      }catch(err){
         res.json(err)
      };
   };

   async getEmailsData(req,res){// получение всех email-адресов получателей макета №17
      try{
          const newRecord = await poolMaket.query(`
             SELECT * FROM emails`)
         res.json(newRecord.rows)
      }catch(err){
         res.json(err)
      };
   };

   async addNewEmail(req,res){// добавление нового email-адреса получателя макета №17
    try{
        await poolMaket.query(`INSERT INTO emails (email,description) VALUES ($1,$2)`,[req.body.newEmail,req.body.newDescription])
        const record = await poolMaket.query(`
            SELECT * FROM emails 
            WHERE email = $1`,[req.body.newEmail])
       res.json(record.rows[0])
    }catch(err){
       res.json(err)
    };
 };

async deleteEmail(req,res){// удаление email-адреса получателя макета №17
    try{
        await poolMaket.query(`DELETE FROM emails WHERE email = $1`,[req.body.email])
        const record = await poolMaket.query(`SELECT * FROM emails`)
    	res.json(record.rows)
    }catch(err){
       	res.json(err)
    };
 };

async saveIp(req,res){
    try{
		await poolMaket.query(`DELETE FROM params WHERE name = $1`,['IP-адрес'])
		await poolMaket.query(`INSERT INTO params (name,value) VALUES ($1,$2)`,['IP-адрес',req.body.ip])
		const params = await poolMaket.query(`SELECT * FROM params WHERE name = $1`, ['IP-адрес']);
		res.json(params.rows)
    }catch(err){
       res.json(err)
    };
 };
async saveName(req,res){
    try{
		await poolMaket.query(`DELETE FROM params WHERE name = $1`,['Имя'])
		await poolMaket.query(`INSERT INTO params (name,value) VALUES ($1,$2)`,['Имя',req.body.name])
		const params = await poolMaket.query(`SELECT * FROM params WHERE name = $1`, ['Имя']);
		res.json(params.rows)
    }catch(err){
       res.json(err)
    };
 };
async savePassw(req,res){
    try{
		await poolMaket.query(`DELETE FROM params WHERE name = $1`,['Пароль'])
		await poolMaket.query(`INSERT INTO params (name,value) VALUES ($1,$2)`,['Пароль',req.body.passw])
		const params = await poolMaket.query(`SELECT * FROM params WHERE name = $1`, ['Пароль']);
		res.json(params.rows)
    }catch(err){
       res.json(err)
    };
 };
async getallparams(req,res){
    try{
		const passw = await poolMaket.query(`SELECT * FROM params WHERE name = $1`, ['Пароль']);
		const ip = await poolMaket.query(`SELECT * FROM params WHERE name = $1`, ['IP-адрес']);
		const name = await poolMaket.query(`SELECT * FROM params WHERE name = $1`, ['Имя']);
		const data = {
			name:name.rows[0].value,
			ip:ip.rows[0].value,
			passw:passw.rows[0].value,
		}
		res.json(data)
    }catch(err){
       res.json(err)
    };
 };

   async getProductionData(req,res){//при нажатии на кнопку "рассчитать выработку за..""
    try{
///////////////////////////////////////////////////////////////////
		const dateToday = req.body.dateWithoutNormalize// дата из запроса

		let dateTodayCopy = new Date(dateToday);
		dateTodayCopy.setDate(dateTodayCopy.getDate()-1)//находим дату предшествующую дате из запроса

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
		let dateYester = yearTomorrow+'-'+monthTomorrow+'-'+dayTomorrow;//предшествующая дата в необходимом для запроса в БД виде
/////////////////////////////////////////////////////
       let dataMonth ;//переменная для данных суммарной выработки за месяц

		const data = await poolMaket.query(`
			SELECT virabotka_s_nach_mes FROM maket17 WHERE date=$1
			`,[dateYester]);
		dataMonth=data.rows[0].virabotka_s_nach_mes;

		if(Number(monthTomorrow)!==Number(dateToday.slice(5,7))) {// если месяц новый - перезаписываем переменную, обнуляем счётчик выработки
			 dataMonth=0
		};
		const dataRash = await poolSutki.query(`
			SELECT value_rashod FROM full_rashod_stok WHERE date=$1
			`,[req.body.date]);
		const dataNapors = await poolSutki.query(`
			SELECT * FROM napors WHERE date=$1
			`,[req.body.date]);

		/////////////////////////////////////////////
		const aiisDataActive = await poolAiis.query(`
			SELECT num_poluchas, num_fid, val_virab
			FROM virabotka_aiiskue 
			WHERE (num_fid BETWEEN $1 And $2) 
			AND date = $3
			AND type_power = $4 
			ORDER BY num_fid, num_poluchas 
	  	`,[1,8,req.body.date,2])

		let prom = aiisDataActive.rows.sort((a,b)=>a['num_fid']-b['num_fid'])
		let arrPgMaketAiis=[]
		for (let i=0;i<prom.length;i++){
			if (Number(prom[i].num_fid)<=8){
				arrPgMaketAiis.push([Number(prom[i].num_poluchas),Number(prom[i].num_fid),prom[i].val_virab,])
			}
		}
		res.json({dataToday:arrPgMaketAiis, dataMonth,dataRash:dataRash.rows,dataNapors:dataNapors.rows})//

    }catch(err){
       res.json(err)
    };
 };
};

module.exports =new maketController();
