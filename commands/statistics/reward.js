const Discord = require('discord.js');
const fs = require("fs");
const functions = require("../../functions.js");
const mysql = require("mysql");
module.exports = {
    name: "reward",
    aliases: ["rewards"],
    category: "statistic",
    description: "Winners for month",
    usage: "<winners count> <rewards after comma>",
    permission: 10,
    run: async (client, message, args) => {
        const localization = require(fs.readFileSync("./language/language.txt").toString().split("\n")[1]);
        const settings = require("../../settings.json");
        let connection = mysql.createConnection({
            host: settings.mySQLhost,
            user: settings.mySQLuser,
            database: "xskyblock database"
        });
        let value = 0;
        let columnName = "";
        let date = new Date();
        let bulion = false;
        let columnExist = false;
        if (args[0] && !isNaN(args[0].slice(-4))&&isNaN(args[0])){
            let year = args[0].slice(-4);
            let month = args[0].slice(0,-4);
            connection.query(`SHOW COLUMNS FROM messages`, function(err, result) {
                if (err) throw err;
                for(let i = 0 ; i<result.length; i++) {
                    if (result[i].Field===month+year) {
                        bulion = true;
                        columnName=month+year;
                    }
                }
                if (bulion === false) {
                    anotherBoolean = true;
                    return message.channel.send(localization.reward_wrong_column_wrong)
                } else {
                    connection.query(`SELECT SUM(${columnName}) as messCount FROM messages`, function (err, result) {
                        if (err) throw err;
                        anotherBoolean = true;
                    });
                }
                columnExist = true;
            });
            value=1;
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
                });
            } else {
                columnName = "fals";
            }
            value = 1;
        } else {
            columnName = functions.createMysqlTable((date.getMonth() + 1)) + date.getFullYear();
            value = 0;
        }
        const delay = (msec) => new Promise((resolve) => setTimeout(resolve, msec));
        await delay(500)
        let usersCount = 0;
        let allMessagesSum = 1;
        if (!args[0 + value]) return message.channel.send(localization.reward_no_winners);
        if (isNaN(args[0 + value])) return message.channel.send(localization.reward_winners_only_number);
        let winnersCount = args[0 + value];
        const embed = new Discord.MessageEmbed().setColor("ORANGE").setTitle(localization.reward_title_for + winnersCount + localization.reward_title_users);
        connection.query(`SELECT id, ${columnName} FROM messages`, function (err, result) {
            //poniższa linijka jest w po aby w przypadku podania złego miesiąca nie wywalił się bot tylko zwrócił wiadomość
            if (bulion === false && args[0] !== "all" && (!isNaN(functions.isMonth(args[0]))) && isNaN(args[0])) return message.channel.send(localization.reward_wrong_column);
            if (err) throw err;
            connection.query(`SELECT SUM(${columnName}) as messCount FROM messages`, function (err, result) {
                if (err) throw err;
                allMessagesSum += result[0].messCount;
            });
            usersCount = result.length;
            if (winnersCount === 0) {
                return message.channel.send(localization.reward_0_winners)
            } else {
                let rewardsAll = "";
                let str = "";
                rewardsAll = message.content.split(" ");
                rewardsAll = rewardsAll.slice(2 + value)
                for (let i = 0; i < rewardsAll.length; i++) {
                    str += rewardsAll[i] + " ";
                }
                rewardsAll = str.split(", ");
                if (rewardsAll.length < winnersCount || rewardsAll[0]==="") {
                    return message.channel.send(localization.reward_too_low_number_of_rewards);
                } else if (rewardsAll.length>winnersCount) {
                    return message.channel.send(localization.reward_too_many_rewards)
                } else {
                    connection.query(`SELECT id, ${columnName} FROM messages ORDER BY ${columnName} DESC LIMIT ${winnersCount}`, function (err, result) {
                        if (args[0]&&!isNaN(args[0].slice(-4))&&isNaN(args[0])) {
                            embed.setFooter(localization.reward_period+ functions.replaceMonth(functions.sqlMonth(args[0]))+" " +functions.sqlYear(args[0]) + localization.reward_all_messages + allMessagesSum + localization.reward_all_users + usersCount + localization.reward_timestamp + functions.today() + " | " + functions.time())
                        } else if (args[0] === "all") {
                            embed.setFooter(localization.reward_period_all + localization.reward_all_messages + allMessagesSum + localization.reward_all_users + usersCount + localization.reward_timestamp + functions.today() + " | " + functions.time())
                        } else if (!isNaN(functions.isMonth(args[0])) && functions.isMonth(args[0]) !== false) {
                            embed.setFooter(localization.reward_period + functions.replaceMonth(args[0]) + localization.reward_all_messages + allMessagesSum + localization.reward_all_users + usersCount + localization.reward_timestamp + functions.today() + " | " + functions.time())
                        } else {
                            embed.setFooter(localization.reward_period + functions.replaceMonth3(date.getMonth() + 1) + localization.reward_all_messages + allMessagesSum + localization.reward_all_users + usersCount + localization.reward_timestamp + functions.today() + " | " + functions.time());
                        }
                        if (err) throw err;
                        if (winnersCount>result.length) return message.channel.send(localization.reward_too_many_winners)
                        for (let i = 0; i < winnersCount; i++) {
                            if (result[i][columnName]===null) {
                                message.channel.send(localization.reward_comparasion_winners_vs_reality)
                                break;
                            }
                            embed.addField(localization.reward_place + (i + 1), localization.reward_monkey + result[i].id + localization.reward_wins + rewardsAll[i] + localization.reward_with + result[i][columnName] + localization.reward_messages)
                        }
                        return message.channel.send(embed)
                    });
                }
            }
        });
    }
}