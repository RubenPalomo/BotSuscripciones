// Importamos la librería node-telegram-bot-api 
const TelegramBot = require('node-telegram-bot-api');

// Creamos una constante que guarda el Token de nuestro Bot de Telegram que previamente hemos creado desde el bot @BotFather
const token = 'TOKEN BOT';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

//Conectamos el bot a una base de datos MySQL tipo local. En este caso se llamará "pruebas"
const mysql = require('mysql');

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "pruebas"
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});
// Si todo va bien a la hora de conectarnos a la BBDD al iniciar el bot devolverá el mensaje "Connected!" por consola.


// ⚠️ Después de este comentario es donde ponemos la lógica de nuestro bot donde podemos crear los comandos y eventos para darle funcionalidades

// Comandos que nuestro bot leerá:

/*
Comando bienvenida. Dará un mensaje al suscriptor, diferente si es nuevo o si ya está registrado
Si no está registrado le tomará el nombre y el nombre de usuario
*/
bot.onText(/\/start/, (msg) => {
    let userName = msg.from.first_name;
    let user = msg.from.username
    let chatId = msg.from.id;

    // Primero buscamos en la BBDD por si existiera un registro previo del chat y del nombre del usuario
    con.connect(function(err) {
        let sql = `SELECT * FROM usuarios WHERE ID=${chatId} AND Nombre="@${user}"`;
        con.query(sql, function (err, result, fields) {
            if (err) {
                bot.sendMessage(chatId, "Ha habido un error con tu solicitud. Inténtelo de nuevo más tarde."); 
                return;
            }

            // En caso de que el ID del chat y el nombre del usuario existan en la BBDD informamos de que ya se registró
            if (result != ""){
                bot.sendMessage(chatId, "Ya estás dado de alta.");
                return;
            }

            // En caso contrario tomamos los datos y los almacenamos en la BBDD
            else{
                con.connect(function(err) {
                    //if (err) throw err;
                    let sql = `INSERT INTO usuarios(ID, Nombre) VALUES (${userId}, "@${user}")`;
                    con.query(sql, function (err, result) {
                       if (err) {
                           bot.sendMessage(chatId, "Ha habido un error con tu solicitud. Inténtelo de nuevo más tarde."); 
                           return;
                       }
                    bot.sendMessage(chatId, `Bienvenido, ${userName}. Te has suscrito satisfactoriamente.❤`);
                    });
                });
            }
        });
    });
});

// Función para mandar mensajes a todos los suscriptores con /msg + Mensaje que quieras mandar
bot.onText(/\/msg (.+)/, (msg, match) => {
    let mensaje = match[1];

    con.connect(function(err) {
        let sql = 'SELECT ID FROM usuarios';
        con.query(sql, function (err, result, fields) {
            for(let i=0; i<result.length;i++){
                bot.sendMessage(result[i].ID, mensaje, {parse_mode: 'Markdown'});
            }
        });
    });
});

// Función ayuda o help, que devolverá un mensaje personalizado
bot.onText(/\/help|\/ayuda/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Hola, *'+msg.from.first_name+'*\nUsa el comando ```/start``` para suscribirte al bot si no lo estás ya.'
    +'\n\nPara cualquier duda o sugerencia no dudes en escribir a *@RubenPal*', {parse_mode: 'Markdown'})
});

/*

    Creado por: Rubén Palomo Fontán
    Contacto: ruben.palomof@gmail.com
 
 */
