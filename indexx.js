var telegramBot = require('node-telegram-bot-api'), // библиотека
	request = require('request'),
	token = '218879003:AAHvop1F6oyxZBQUSmCLvdY4wLBCY-Y9mZU';	// Токен
	mysql = require('mysql');


var bot = new telegramBot(token, {	// Класс
	polling: true	// бот не отключится пока не захочу
});



/* ---------------- DATABASE ---------------- */

var express = require('express');
var mysql = require('mysql');
var app = express();



var db_config = {
  host: 'localhost',
	user: 'root',
	password: '',
	database: 'bdbot'
};

var connection;

function handleDisconnect() {
  connection = mysql.createConnection(db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.

  connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

handleDisconnect();




/* ---------------- DATABASE ---------------- */




var numOfGroup;
var numOfCourse;
var numOfDay;




bot.on('message', function(msg){	// Функция для получения сообщениий
	var id = msg.from.id,			// id человека
		name = msg.from.first_name;
var back = 'start';


		if(msg.text == '/start'){
			numOfGroup = '';
			numOfCourse = '';
			numOfDay = '';
			start(id);
		} if(msg.text == 'Узнать расписание' && back == 'start'){
			numOfGroup = '';
			numOfDay = '';
			course(id);
		}
		if (msg.text == 'Назад') {
			if (back == 'course') {
				start(id);
			} else{}
		}

		if((msg.text == 'пн' || msg.text == 'вт' || msg.text == 'ср' || msg.text == 'чт' || msg.text == 'пт' || msg.text == 'сб') && numOfGroup != 0 && numOfCourse != 0 && numOfDay != 0){
			send_rasp();
		}

		/*

		switch(msg.text){
			case '/start':
				var numOfGroup;
				var numOfCourse;
				var numOfDay;
				start(id);
			break;
			case 'hello':
				bot.sendMessage(id, 'Привет');
			break;
			case 'Узнать расписание':
				course(id);
			break;

			case 'Назад':
				switch(back){
					case 'start':
						start();
					break;
					case 'course':
						course
					break;
				}

			break;

			if (msg.text == '1 курс' || msg.text == '2 курс' || msg.text == '3 курс' || msg.text == '4 курс' || msg.text == '5 курс') {}
				group(id);
		}

		*/
		


/* ------------------ FUNCTIONS ------------------ */









/* ------------------ FUNCTIONS ------------------ */



	console.log(msg);
	

});



function start(id){
	back = 'start';
	bot.sendMessage(id, 'Привет, что желаешь узнать?', {
		reply_markup: JSON.stringify({
			keyboard: [
				[{
					text: 'Узнать расписание',
					callback_data: 'rasp'
				}],
				[{
					text: 'Номер недели',
					callback_data: 'hello'
				}],
				[{
					text: 'Feedback',
					callback_data: 'back',
					remove_keyboard: true
				}]

			],
		})
	});

	/*bot.on('message', function(msg){
		var id = msg.from.id;
		if(msg.text == 'Узнать расписание' && back == 'start'){
			numOfGroup = 0;
			numOfDay = 0;
			course(id);
		}
	});*/
	
}


function group(id){
	back = 'group';
	connection.query('SELECT * FROM databaserasp WHERE course = ?', numOfCourse, function(error, rows, fields){
			if(error){
				bot.sendMessage(id, 'Ошибка БД, напиши мне @ArtWhite');
			} else {
				//console.log(rows);
					var groups = {};
					for (i in rows){
						var item = rows[i];
						groups[item['groups'].toString()] = true;

					}
					var keyboard = [];
					for (i in groups){
						keyboard.push([{text: i}]);
					}
					bot.sendMessage(id, 'Выбери свою группу', {
					reply_markup: JSON.stringify({
						keyboard: keyboard,
					})
					});

					
				
				
			}

			bot.on('message', function(msg){
				numOfGroup = msg.text;

				console.log(numOfGroup);
				console.log(numOfCourse);
				if (numOfCourse !== '' && numOfGroup !== '') {
						days(id);
				} else{
					start(id);
				}
		});
	});


}



function course(id){

	back = 'course';
	connection.query('SELECT * FROM databaserasp', function(error, rows, fields){
		if(error){
			bot.sendMessage(id, 'Ошибка БД, напиши мне @ArtWhite');
		} else {
			//console.log(rows);
				var courses = {};
				for (i in rows){
					var item = rows[i];
					courses[item['course'].toString()] = true;

				}
				var keyboard = [];
				for (i in courses){
					keyboard.push([{text: i}]);
				}
				bot.sendMessage(id, 'Выбери свой курс', {
				reply_markup: JSON.stringify({
					keyboard: keyboard,
				})
				});
				

				
			
		}
		
		bot.on('message', function(msg){
			numOfCourse = msg.text;

			console.log(numOfCourse);
				if (numOfCourse !== '') {
						group(id);
				} else{
					start();
				}
		});
	});
}

function days(id){
	back = 'day';
	/*
	connection.query('SELECT * FROM databaserasp WHERE course = ? AND groups = ?', numOfCourse, numOfGroup , function(error, rows, fields){
			if(error){
				bot.sendMessage(id, 'Ошибка БД, напиши мне @ArtWhite');
			} else {
				//console.log(rows);*/
					bot.sendMessage(id, 'Выбери день недели', {
					reply_markup: JSON.stringify({
						keyboard: [
						[{
							text: 'пн'
						},
						{
							text: 'вт'
						}],
						[{
							text: 'ср'
						},
						{
							text: 'чт'
						}],
						[{
							text: 'пт'
						},
						{
							text: 'сб'
						}]
						]
					})
					});


			bot.on('message', function(msg){
				switch(msg.text){
					case 'пн': 
						numOfDay = 1;
					break;
					case 'вт': 
						numOfDay = 2;
					break;
					case 'ср': 
						numOfDay = 3;
					break;
					case 'чт': 
						numOfDay = 4;
					break;
					case 'пт': 
						numOfDay = 5;
					break;
					case 'сб': 
						numOfDay = 6;
					break;
				}
				
				console.log(numOfDay);
				if (numOfCourse !== '' && numOfGroup !== '' && numOfDay !== '') {
						send_rasp(id);
				}

			});
				
		/*	}
	});*/
}




function send_rasp(id) {
	connection.query('SELECT * FROM databaserasp WHERE course = ? AND groups = ? day = ?', [numOfCourse, numOfGroup, numOfDay] , function(error, rows, fields){
		if(error){
				bot.sendMessage(id, 'Ошибка БД, напиши мне @ArtWhite');
		} else {
			bot.sendMessage(id, rows[rasp]);
		}
	});
}


