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
        const localization = require(fs.readFileSync("./language/language.txt").toString().split("\n")[1]);
        const settings = require("../../settings.json");
        let personID = '';
        let bool = false;
        let connection = mysql.createConnection({
            host: settings.mySQLhost,
            user: settings.mySQLuser,
            database: "xskyblock database"
        });
        let columnName = "";
        let bulion = false;
        let date = new Date();
        let anotherBoolean = false;
        if (args[0] && !isNaN(args[0].slice(-4)) && isNaN(args[0]) && (!args[0].startsWith("<@"))) {
            let year = args[0].slice(-4);
            let month = args[0].slice(0, -4);
            connection.query(`SHOW COLUMNS FROM messages`, function (err, result) {
                if (err) throw err;
                for (let i = 0; i < result.length; i++) {
                    if (result[i].Field === month + year) {
                        bulion = true;
                        columnName = month + year;
                    }
                }
                if (bulion === false) {
                    anotherBoolean = true;
                    return message.channel.send(localization.stats_column_doesnt_exist)
                }
                columnExist = true;
            });
            value = 1;
        } else if (args[0] && functions.isMonth(args[0]) !== false) {
            if (functions.isMonth(args[0]) === "all") {
                columnName = "allMessages";
            } else if (!isNaN(functions.isMonth(args[0]))) {
                columnName = functions.createMysqlTable(functions.isMonth(args[0])) + date.getFullYear();
                connection.query("SHOW COLUMNS FROM messages", function (err, result) {
                    if (err) throw err;
                    for (let i = 0; i < result.length; i++) {
                        if (result[i].Field === columnName) {
                            bulion = true;
                        }
                    }
                    if (bulion === false) {
                        anotherBoolean = true;
                        return message.channel.send(localization.stats_wrong_column)
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
                return message.channel.send(localization.stats_id_has_to_be_number);
            } else if (args[0 + value].length !== 18 && bool === false) {
                return message.channel.send(localization.stats_18_char_long);
            } else if (!message.guild.members.cache.get(args[0 + value]) && bool === false) {
                return message.channel.send(localization.stats_not_found);
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
        connection.query(`SELECT id, ${columnName} FROM messages WHERE id = '${personID}'`, function (err, result) {
            if (anotherBoolean === true) return;
            if (bulion === false && (args[0] && !isNaN(functions.isMonth(args[0]))) && (args[0] && functions.isMonth(args[0]) === "all")) return message.channel.send(localization.stats_column_not_found);
            if (err) throw err;
            let boolean = true;
            if (result.length === 0) {
                boolean = false;
                return message.channel.send(localization.stats_nothing_written_yet);
            } else if (!result[0][columnName] || isNaN(result[0][columnName])) {
                boolean = false;
                return message.channel.send(localization.stats_nothing_written_period);
            } else {
                boolean = true;
            }
            let monthIsUnknown = "";
            if (args[0] && !isNaN(args[0].slice(-4)) && isNaN(args[0])) {
                monthIsUnknown = functions.replaceMonth2(functions.sqlMonth(args[0])) + " " + functions.sqlYear(args[0])
            } else if (args[0] && !isNaN(functions.isMonth(args[0])) && functions.isMonth(args[0])!==false) {
                monthIsUnknown = functions.replaceMonth2(args[0]);
            } else if (args[0] && functions.isMonth(args[0]) === "all") {
                monthIsUnknown = localization.stats_all_the_time;
            } else {
                monthIsUnknown = localization.stats_this_month;
            };
            if (boolean === true) {
                if (personID === message.author.id) {
                    return message.channel.send(localization.stats_you + result[0][columnName] + localization.stats_messages + monthIsUnknown);
                } else {
                    return message.channel.send(localization.stats_monkey + result[0].id + localization.stats_sent + result[0][columnName] + localization.stats_messages + monthIsUnknown);
                }
            } else {
                return;
            }
        });
    }
}