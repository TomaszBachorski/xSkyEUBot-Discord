const Discord = require('discord.js');
const fs = require("fs");
const mysql = require("mysql");
const functions = require("../../functions.js")
module.exports = {
    name: "topyear",
    aliases: ["yeartop"],
    category: "statistics",
    description: "Shows top or rewards top players of the year",
    usage: "[year] <number of winners> <rewards after comma>",
    permission: 10,
    run: async (client, message, args) => {
        const localization = require(fs.readFileSync("./language/language.txt").toString().split("\n")[1]);
        const settings = require("../../settings.json");
        let year = new Date().getFullYear();
        let monthArray = [];
        let messagesNumber = 0;
        let allusers = 0;
        let usersToSubstract = 0;
        const embed = new Discord.MessageEmbed().setColor("ORANGE");
        let connection = mysql.createConnection({
            host: settings.mySQLhost,
            user: settings.mySQLuser,
            database: "xskyblock database"
        });
        if (args.length === 0) {
            connection.query(`SHOW COLUMNS FROM messages LIKE '%${year}'`, function (err, result) {
                if (err) throw err;
                connection.query(`SELECT Count(id) AS allUsers FROM messages`, function (err, result) {
                    if (err) throw err;
                    allusers = result[0].allUsers;
                });
                for (let i = 0; i < result.length; i++) {
                    monthArray.push(result[i].Field);
                }
                for (let i = 0; i < result.length; i++) {
                    connection.query(`SELECT SUM(${monthArray[i]}) AS ${monthArray[i]} FROM messages`, function (err, result) {
                        if (err) throw err;
                        messagesNumber = messagesNumber + result[0][monthArray[i]];
                    });
                }
                let monthsAfterComma = "";
                let monthsAfterAnd = "";
                let monthsAfterPlus = ""
                for (let i = 0; i < result.length; i++) {
                    if (i === result.length - 1) {
                        monthsAfterComma = monthsAfterComma + result[i].Field;
                        monthsAfterAnd = monthsAfterAnd + result[i].Field;
                        monthsAfterPlus = monthsAfterPlus + result[i].Field;
                    } else {
                        monthsAfterComma = monthsAfterComma + result[i].Field + ", ";
                        monthsAfterAnd = monthsAfterAnd + result[i].Field + " IS NULL AND ";
                        monthsAfterPlus = monthsAfterPlus + result[i].Field + "+";
                    }
                }
                connection.query(`SELECT ID, ${monthsAfterComma} FROM messages WHERE ${monthsAfterAnd} IS NULL`, function (err, result) {
                    if (err) throw err;
                    usersToSubstract = result.length;
                });
                let num = 10;
                if (allusers < 10) {
                    num = allusers;
                }
                connection.query(`SELECT id, ${monthsAfterPlus} as total FROM messages ORDER BY total DESC`, function (err, result) {
                    if (err) throw err;
                    for (let i = 0; i < result.length; i++) {
                        embed.addField(localization.topyear_place + (i + 1), localization.topyear_monkey + result[i].id + localization.topyear_ending + localization.topyear_wrote + result[i].total + localization.topyear_messages)
                    }
                });
            });
            const delay = (msec) => new Promise((resolve) => setTimeout(resolve, msec));
            await delay(500)
            if (allusers < 10) {
                embed.setTitle(localization.topyear_top + allusers + localization.topyear_of + year);
            } else {
                embed.setTitle(localization.topyear_10 + year);
            }
            embed.setFooter(localization.topyear_in + year + localization.topyear_colon + (allusers - usersToSubstract) + localization.topyear_whatever + allusers + localization.topyear_all_messages + year + localization.topyear_colon + messagesNumber + localization.topyear_timestamp + functions.today() + " | " + functions.time())

            message.channel.send(embed);
        } else {
            if (args.length>1 && !isNaN(args[0])) {
                if (args.length===2) return message.channel.send(localization.topyear_no_rewatrd_specified);
                if (isNaN(args[1])) return message.channel.send(localization.topyear_Only_numbers);
                if (args[0].length!==4) return message.channel.send(localization.topyear_year_not_specified)
                if (isNaN(args[0])) return message.channel.send(localization.topyear_4_digit);
                let year = args[0];
                let winnersCount = args[1];
                let rewardsAll = "";
                let str = "";
                rewardsAll = message.content.split(" ");
                rewardsAll = rewardsAll.slice(3)
                for (let i = 0; i < rewardsAll.length; i++) {
                    str += rewardsAll[i] + " ";
                }
                rewardsAll = str.split(", ");
                if (rewardsAll.length < winnersCount || rewardsAll[0]==="") {
                    return message.channel.send(localization.topyear_too_quiet);
                } else if (rewardsAll.length>winnersCount) {
                    return message.channel.send(localization.topyear_too_many)
                } else {
                    let bulion = false;
                    let anotherBulion = false;
                    connection.query(`SHOW COLUMNS FROM messages LIKE '%${year}'`, function (err, result) {
                        if (err) throw err;
                        if (result.length === 0) return bulion = true;
                        if (winnersCount>result.length) return anotherBulion = true; 
                        connection.query(`SELECT Count(id) AS allUsers FROM messages`, function (err, result) {
                        if (err) throw err;
                            allusers = result[0].allUsers;
                        });
                        for (let i = 0; i < result.length; i++) {
                            monthArray.push(result[i].Field);
                        }
                        for (let i = 0; i < result.length; i++) {
                            connection.query(`SELECT SUM(${monthArray[i]}) AS ${monthArray[i]} FROM messages`, function (err, result) {
                                if (err) throw err;
                            messagesNumber = messagesNumber + result[0][monthArray[i]];
                            });
                        }
                        let monthsAfterComma = "";
                        let monthsAfterAnd = "";
                        let monthsAfterPlus = ""
                        for (let i = 0; i < result.length; i++) {
                            if (i === result.length - 1) {
                                monthsAfterComma = monthsAfterComma + result[i].Field;
                            monthsAfterAnd = monthsAfterAnd + result[i].Field;
                                monthsAfterPlus = monthsAfterPlus + result[i].Field;
                            } else {
                                monthsAfterComma = monthsAfterComma + result[i].Field + ", ";
                                monthsAfterAnd = monthsAfterAnd + result[i].Field + " IS NULL AND ";
                                monthsAfterPlus = monthsAfterPlus + result[i].Field + "+";
                            }
                        }
                        connection.query(`SELECT ID, ${monthsAfterComma} FROM messages WHERE ${monthsAfterAnd} IS NULL`, function (err, result) {
                            if (err) throw err;
                            usersToSubstract = result.length;
                        });
                        connection.query(`SELECT id, ${monthsAfterPlus} as total FROM messages ORDER BY total DESC`, function (err, result) {
                            if (err) throw err;
                            for (let i = 0; i < winnersCount; i++) {
                                embed.addField(localization.topyear_place + (i + 1), localization.topyear_monkey + result[i].id + localization.topyear_ending + localization.topyear_wins+rewardsAll[i] + localization.topyear_with + result[i].total + localization.topyear_messages)
                            }
                        });
                    });
                    const delay = (msec) => new Promise((resolve) => setTimeout(resolve, msec));
                    await delay(500)
                    if (bulion === true) return message.channel.send(localization.topyear_no_messages)
                    if (anotherBulion === true) return message.channel.send(localization.topyear_too_many_winners)
                    if (allusers < 10) {
                        embed.setTitle(localization.topyear_reward_for + allusers + localization.topyear_year + year);
                    } else {
                        embed.setTitle(localization.topyear_10_reward + year);
                    }
                    embed.setFooter(localization.topyear_in + year + localization.topyear_colon + (allusers - usersToSubstract) + localization.topyear_whatever + allusers + localization.topyear_all_messages + year + localization.topyear_colon + messagesNumber + localization.topyear_timestamp + functions.today() + " | " + functions.time())
                    return message.channel.send(embed);
                }
                
            } else {
                if (isNaN(args[0])) return message.channel.send(localization.topyear_NaN);
                if (args[0].length !== 4) return message.channel.send(localization.topyear_4_digit);
                year = args[0];
                let bulion = false;
                connection.query(`SHOW COLUMNS FROM messages LIKE '%${year}'`, function (err, result) {
                    if (err) throw err;
                    if (result.length === 0) return bulion = true;
                    connection.query(`SELECT Count(id) AS allUsers FROM messages`, function (err, result) {
                        if (err) throw err;
                        allusers = result[0].allUsers;
                    });
                    for (let i = 0; i < result.length; i++) {
                        monthArray.push(result[i].Field);
                    }
                    for (let i = 0; i < result.length; i++) {
                        connection.query(`SELECT SUM(${monthArray[i]}) AS ${monthArray[i]} FROM messages`, function (err, result) {
                            if (err) throw err;
                            messagesNumber = messagesNumber + result[0][monthArray[i]];
                        });
                    }
                    let monthsAfterComma = "";
                    let monthsAfterAnd = "";
                    let monthsAfterPlus = ""
                    for (let i = 0; i < result.length; i++) {
                        if (i === result.length - 1) {
                            monthsAfterComma = monthsAfterComma + result[i].Field;
                            monthsAfterAnd = monthsAfterAnd + result[i].Field;
                            monthsAfterPlus = monthsAfterPlus + result[i].Field;
                        } else {
                            monthsAfterComma = monthsAfterComma + result[i].Field + ", ";
                            monthsAfterAnd = monthsAfterAnd + result[i].Field + " IS NULL AND ";
                            monthsAfterPlus = monthsAfterPlus + result[i].Field + "+";
                        }
                    }
                    connection.query(`SELECT ID, ${monthsAfterComma} FROM messages WHERE ${monthsAfterAnd} IS NULL`, function (err, result) {
                        if (err) throw err;
                        usersToSubstract = result.length;
                    });
                    let num = 10;
                    if (allusers < 10) {
                        num = allusers;
                    }
                    connection.query(`SELECT id, ${monthsAfterPlus} as total FROM messages ORDER BY total DESC`, function (err, result) {
                        if (err) throw err;
                        for (let i = 0; i < result.length; i++) {
                            embed.addField(localization.topyear_place + (i + 1), localization.topyear_monkey + result[i].id + localization.topyear_ending + localization.topyear_wrote + result[i].total + localization.topyear_messages)
                        }
                    });
                });
                const delay = (msec) => new Promise((resolve) => setTimeout(resolve, msec));
                await delay(500)
                if (bulion === true) return message.channel.send(localization.topyear_no_messages)
                if (allusers < 10) {
                    embed.setTitle(localization.topyear_top + allusers + localization.topyear_of + year);
                } else {
                    embed.setTitle(localization.topyear_10 + year);
                }
                embed.setFooter(localization.topyear_in + year + localization.topyear_colon + (allusers - usersToSubstract) + localization.topyear_whatever + allusers + localization.topyear_all_messages + year + localization.topyear_colon + messagesNumber + localization.topyear_timestamp + functions.today() + " | " + functions.time())
                message.channel.send(embed);
            }
        }
    }
}