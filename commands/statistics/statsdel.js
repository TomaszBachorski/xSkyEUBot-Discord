

// Broken whilte trying to $statsdel @iThomash#1238



// const Discord = require('discord.js');
// const fs = require("fs");
// const mysql = require("mysql");
// const functions = require('../../functions');
// module.exports = {
//     name: "statsdel",
//     aliases: ["statsremove", "statsdelete", "delstats"],
//     category: "statistics",
//     description: "Deleting user from database with messages count",
//     usage: "[month] <mention/userID>",
//     permission: 10,
//     run: async (client, message, args) => {
//         const settings = require("../../settings.json");
//         let personID = "";
//         let bool = false;
//         let columnName = "";
//         let bulion = false;
//         let date = new Date();
//         let connection = mysql.createConnection({
//             host: settings.mySQLhost,
//             user: settings.mySQLuser,
//             database: "xskyblock database"
//         });
//         if (args.length === 0) return message.channel.send({embeds: [new Discord.MessageEmbed().setTitle("BŁĄD").setColor("RED").setDescription(settings.prefix + "delstats miesiąc użytkownik")]})
//         if (args[0] && !isNaN(args[0].slice(-4)) && isNaN(args[0]) && (!args[0].startsWith("<@"))) {
//             let year = args[0].slice(-4);
//             let month = args[0].slice(0, -4);
//             connection.query(`SHOW COLUMNS FROM messages`, (err, result) => {
//                 if (err) throw err;
//                 for (let i = 0; i < result.length; i++) {
//                     if (result[i].Field === month + year) {
//                         bulion = true;
//                         columnName = month + year;
//                     }
//                 }
//                 if (bulion === false) {
//                     anotherBoolean = true;
//                     return message.channel.send({content: "Kolumna nie istnieje"})
//                 }
//                 columnExist = true;
//             });
//             value = 1;
//         } else if (args[0] && functions.isMonth(args[0]) !== false) {
//             if (functions.isMonth(args[0]) === "all") {
//                 columnName = "allMessages";
//             } else if (!isNaN(functions.isMonth(args[0]))) {
//                 columnName = functions.createMysqlTable(functions.isMonth(args[0])) + date.getFullYear();
//                 connection.query("SHOW COLUMNS FROM messages", (err, result) => {
//                     if (err) throw err;
//                     for (let i = 0; i < result.length; i++) {
//                         if (result[i].Field === columnName) {
//                             bulion = true;
//                         }
//                     }
//                     if (bulion === false) {
//                         anotherBoolean = true;
//                         return message.channel.send({content: "Błędna kolumna"})
//                     }
//                 });
//             } else {
//                 columnName = `${new Date().toLocaleDateString('en', {month: 'long'})}${new Date().getFullYear()}`;
//             }
//             value = 1;
//         } else {
//             columnName = functions.createMysqlTable((date.getMonth() + 1)) + date.getFullYear();
//             value = 0;
//         }
//         if (message.mentions.members.first()) bool = true;
//         console.log(value)
//         if (args[0 + value]) {
//             if (isNaN(args[0 + value]) && bool === false) {
//                 return message.channel.send({content: "ID jest liczbą"});
//             } else if (args[0 + value].length !== 18 && bool === false) {
//                 return message.channel.send({content: "ID jest długie na 18 znaków"});
//             } else if (!message.guild.members.cache.get(args[0 + value]) && bool === false) {
//                 return message.channel.send({content: "Osoba nie została znaleziona"});
//             } else {
//                 if (bool === true) {
//                     personID = message.mentions.users.first().id;
//                 } else {
//                     personID = args[0 + value];
//                 }
//             }
//         } else {
//             personID = message.author.id;
//         }
//         const delay = (msec) => new Promise((resolve) => setTimeout(resolve, msec));
//         await delay(500)

//         const embed = new Discord.MessageEmbed();
//         connection.query(`SELECT id, allMessages, ${columnName} FROM messages WHERE id = '${personID}'`, (err, result) => {
//             let bo = false;
//             if (args.length === 1 && message.mentions.users.first()) bo = true;
//             if (bulion === false && args[0] !== "all" && (args[0] !== personID) && bo === false) return message.channel.send({embeds: [embed.setColor("RED").setTitle("BŁĄD").setDescription("Ten miesiąc nie został jeszcze stworzony lub zwyczajnie w nim nic nie napsiano")]});
//             if (err) throw err;
//             let monthIsUnknown = "";
//             if (args[0] && !isNaN(args[0].slice(-4)) && isNaN(args[0])) {
//                 monthIsUnknown = args[0];
//             } else if (args[0] && functions.isMonth(args[0]) === "all") {
//                 monthIsUnknown = "z wszechczasów ";
//             } else {
//                 monthIsUnknown = "aktualnego miesiąca";
//             };
//             if (result.length === 0) {
//                 embed.setColor("RED").setTitle("BŁĄD").setDescription("Ta osoba nie napisała jeszcze nic na tym serwerze discord");
//                 return message.channel.send({embeds: [embed]});
//             } else {
//                 if (!result[0][columnName]) {
//                     embed.setTitle("BŁĄD").setDescription("W miesiącu który podałeś, osoba nie napisała żadnej wiadomości").setColor("RED");
//                     return message.channel.send({embeds: [embed]});
//                 } else {
//                     if (args[0] === "all") {
//                         connection.query(`DELETE FROM messages WHERE id = '${personID}'`, function (err, result) {
//                             if (err) throw err;
//                             if (result.length === 0) {
//                                 return message.channel.send({embeds: [embed.setColor("RED").setTitle("BŁĄD").setDescription("CO DO JASNEJ CIASNEJ?")]});
//                             } else {
//                                 return message.channel.send({embeds: [embed.setColor("GREEN").setTitle("SUKCES").setDescription(`Pomyślnie usunięto <@${personID}> z bazy danych z wiadomościami`)]});
//                             }
//                         });
//                     } else {
//                         connection.query(`UPDATE messages SET ${columnName} = 1, allMessages = ${(result[0].allMessages - result[0][columnName] + 1)} WHERE id = ${personID}`, function (err, result) {
//                             if (err) throw err;
//                             embed.setColor("GREEN").setTitle("SUKCES").setDescription(`Pomyślnie usunięto wiadomości z ${monthIsUnknown} dla <@${personID}>`)
//                             return message.channel.send({embeds: [embed]});
//                         });
//                     }
//                 }
//             }
//         });
//     }
// }