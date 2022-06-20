const Discord = require('discord.js');
const fs = require("fs");
const mysql = require("mysql");
const functions = require('../../functions');
module.exports = {
    name: "statsdel",
    aliases: ["statsremove", "statsdelete", "delstats"],
    category: "statistics",
    description: "Deleting user from database with messages count",
    usage: "[month] <mention/userID>",
    permission: 10,
    run: async (client, message, args) => {
        const localization = require(fs.readFileSync("./language/language.txt").toString().split("\n")[1]);
        const settings = require("../../settings.json");
        let personID = "";
        let bool = false;
        let columnName = "";
        let bulion = false;
        let date = new Date();
        let connection = mysql.createConnection({
            host: settings.mySQLhost,
            user: settings.mySQLuser,
            database: "xskyblock database"
        });
        if (args.length===0) return message.channel.send(new Discord.MessageEmbed().setTitle(localization.statsdel_error).setColor("RED").setDescription(settings.prefix + localization.statsdel_command))
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
                    return message.channel.send(localization.statsdel_column_doesnt_exist)
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
                        return message.channel.send(localization.statsdel_wrong_column)
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
                return message.channel.send(localization.statsdel_id_has_to_be_number);
            } else if (args[0 + value].length !== 18 && bool === false) {
                return message.channel.send(localization.statsdel_18_char_long);
            } else if (!message.guild.members.cache.get(args[0 + value]) && bool === false) {
                return message.channel.send(localization.statsdel_not_found);
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

        const embed = new Discord.MessageEmbed();
        connection.query(`SELECT id, allMessages, ${columnName} FROM messages WHERE id = '${personID}'`, function (err, result) {
            let bo = false;
            if (args.length === 1 && message.mentions.users.first()) bo = true;
            if (bulion === false && args[0] !== "all" && (args[0] !== personID) && bo === false) return message.channel.send(embed.setColor("RED").setTitle(localization.statsdel_error).setDescription(localization.statsdel_column_not_found));
            if (err) throw err;
            let monthIsUnknown = "";
            if (args[0] && !isNaN(args[0].slice(-4)) && isNaN(args[0])) {
                monthIsUnknown = functions.replaceMonth4(functions.sqlMonth(args[0])) + " " + functions.sqlYear(args[0])
            } else if (args[0] && !isNaN(functions.isMonth(args[0])) && functions.isMonth(args[0])!==false) {
                monthIsUnknown = functions.replaceMonth4(args[0]);
            } else if (args[0] && functions.isMonth(args[0]) === "all") {
                monthIsUnknown = localization.statsdel_all_the_time;
            } else {
                monthIsUnknown = localization.statsdel_this_month;
            };
            if (result.length === 0) {
                embed.setColor("RED").setTitle(localization.statsdel_error).setDescription(localization.statsdel_not_written);
                return message.channel.send(embed);
            } else {
                if (!result[0][columnName]) {
                    embed.setTitle(localization.statsdel_error).setDescription(localization.statsdel_period_not_written).setColor("RED");
                    return message.channel.send(embed);
                } else {
                    if (args[0] === "all") {
                        connection.query(`DELETE FROM messages WHERE id = '${personID}'`, function (err, result) {
                            if (err) throw err;
                            if (result.length === 0) {
                                return message.channel.send(embed.setColor("RED").setTitle(localization.statsdel_error).setDescription(localization.statsdel_wtf));
                            } else {
                                return message.channel.send(embed.setColor("GREEN").setTitle(localization.statsdel_success).setDescription(localization.statsdel_success_deletion + personID + localization.statsdel_deletion_from));
                            }
                        });
                    } else {
                        connection.query(`UPDATE messages SET ${columnName} = 1, allMessages = ${(result[0].allMessages - result[0][columnName] + 1)} WHERE id = ${personID}`, function (err, result) {
                            if (err) throw err;
                            embed.setColor("GREEN").setTitle(localization.statsdel_success).setDescription(localization.statsdel_delete_from + monthIsUnknown + localization.statsdel_whose + personID + localization.statsdel_kwak)
                            return message.channel.send(embed);
                        });
                    }
                }
            }
        });
    }
}