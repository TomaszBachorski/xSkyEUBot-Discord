const Discord = require('discord.js');
const fs = require("fs");
const mysql = require("mysql");
const functions = require('../../functions');
module.exports = {
    name: "stats",
    aliases: [],
    category: "statistics",
    description: "How many messages person sent in month",
    usage: "[month] [mention/userID]",
    permission: 10,
    run: async (client, message, args) => {
        const settings = require("../../settings.json");
        let personID = '';
        let bool = false;
        let connection = mysql.createConnection({
            host: settings.mySQLhost,
            user: settings.mySQLuser,
            password: settings.mySQLpassword,
            database: settings.mySQLdatabase
        });
        let columnName = "";
        let bulion = false;
        let date = new Date();
        let anotherBoolean = false;
        if (args[0] && !isNaN(args[0].slice(-4)) && isNaN(args[0]) && (!args[0].startsWith("<@"))) {
            let year = args[0].slice(-4);
            let month = args[0].slice(0, -4);
            connection.query(`SHOW COLUMNS FROM messages`, (err, result) => {
                if (err) throw err;
                for (let i = 0; i < result.length; i++) {
                    if (result[i].Field === month + year) {
                        bulion = true;
                        columnName = month + year;
                    }
                }
                if (bulion === false) {
                    anotherBoolean = true;
                    return message.channel.send({content: "Kolumna nie istnieje"})
                }
                columnExist = true;
            });
            value = 1;
        } else if (args[0] && functions.isMonth(args[0]) !== false) {
            if (functions.isMonth(args[0]) === "all") {
                columnName = "allMessages";
            } else if (!isNaN(functions.isMonth(args[0]))) {
                columnName = functions.createMysqlTable(functions.isMonth(args[0])) + date.getFullYear();
                connection.query("SHOW COLUMNS FROM messages", (err, result) => {
                    if (err) throw err;
                    for (let i = 0; i < result.length; i++) {
                        if (result[i].Field === columnName) {
                            bulion = true;
                        }
                    }
                    if (bulion === false) {
                        anotherBoolean = true;
                        return message.channel.send("Ten miesi??c nie zosta?? stworzony lub nikt jeszcze nie napisa?? w danym miesi??cu")
                    }
                });
            } else {
                columnName = "fals";
            }
            value = 1;
        } else {
            columnName = functions.createMysqlTable((date.getMonth() + 1)) + date.getFullYear();
            value = 0;
        }
        if (message.mentions.members.first()) bool = true;
        if (args[0 + value]) {
            if (isNaN(args[0 + value]) && bool === false) {
                return message.channel.send("ID musi by?? liczb??");
            } else if (args[0 + value].length !== 18 && bool === false) {
                return message.channel.send("ID jest d??ugie na 18 znak??w");
            } else if (!message.guild.members.cache.get(args[0 + value]) && bool === false) {
                return message.channel.send("U??ytkownik nie zosta?? znaleziony");
            } else {
                if (bool === true) {
                    personID = message.mentions.users.first().id;
                } else {
                    personID = args[0 + value];
                }
            }
        } else {
            personID = message.author.id;
        }
        const delay = (msec) => new Promise((resolve) => setTimeout(resolve, msec));
        await delay(500)
        connection.query(`SELECT id, ${columnName} FROM messages WHERE id = '${personID}'`, (err, result) => {
            if (anotherBoolean === true) return;
            if (bulion === false && (args[0] && !isNaN(functions.isMonth(args[0]))) && (args[0] && functions.isMonth(args[0]) === "all")) return message.channel.send({content: "Ten miesi??c nie zosta?? jeszcze utworzony lub nic wtedy nie napisano"});
            if (err) throw err;
            let boolean = true;
            if (result.length === 0) {
                boolean = false;
                return message.channel.send("Ta osoba nic nie napisa??a jeszcze na tym serwerze");
            } else if (!result[0][columnName] || isNaN(result[0][columnName])) {
                boolean = false;
                return message.channel.send("Ta osoba nic nie napisa??a jescze w tym okresie");
            }
            if (boolean === false) return
            let monthIsUnknown = "";
            if (args[0] && !isNaN(args[0].slice(-4)) && isNaN(args[0])) {
                monthIsUnknown = args[0];
            } else if (args[0] && functions.isMonth(args[0]) === "all") {
                monthIsUnknown = "ca??kowicie";
            } else {
                monthIsUnknown = "w tym miesi??cu";
            };
            if (personID === message.author.id) return message.channel.send(`Wys??a??e?? ${result[0][columnName]} wiadomo??ci ${monthIsUnknown}`);
            return message.channel.send(`<@${result[0].id}> wys??a?? ${result[0][columnName]} wiadomo??ci ${monthIsUnknown}`);
        });
    }
}