const Discord = require('discord.js');
const fs = require("fs");
const functions = require("../../functions.js");
const mysql = require("mysql");
module.exports = {
    name: "top",
    aliases: [],
    category: "statistics",
    description: "Shows many things from db about messages",
    usage: "[month] [place/top] [number]",
    permission: 10,
    run: async (client, message, args) => {
        const localization = require(fs.readFileSync("./language/language.txt").toString().split("\n")[1]);
        const settings = require("../../settings.json");
        let connection = mysql.createConnection({
            host: settings.mySQLhost,
            user: settings.mySQLuser,
            database: "xskyblock database"
        });
        const embed = new Discord.MessageEmbed().setColor("ORANGE");
        let value = 0;
        let columnName = "";
        let date = new Date();
        let bulion = false; //sprawdzenie czy kolumna istnieje, jeśli tak =true
        let usersCount = 0;
        let anotherBoolean = true; //zmienna do późniejszego sprawdzenia czy kolumna istnieje
        let number = 0;
        let order_by = "";
        let columnExist = false;
        if (args[0]&&!isNaN(args[0].slice(-4))&&isNaN(args[0])) {
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
                    anotherBoolean = false;
                    return message.channel.send(localization.top_wrong_column)
                } else {
                    connection.query(`SELECT SUM(${columnName}) as messCount FROM messages`, function (err, result) {
                        if (err) throw err;
                        anotherBoolean = true;
                    });
                }
                columnExist = true;
                return;
            });
            value = 1;
        } else if (args[0] && functions.isMonth(args[0]) !== false) {
            if (functions.isMonth(args[0]) === "all") {
                columnName = "allMessages";
            } else if (!isNaN(functions.isMonth(args[0]))) {
                columnName = functions.createMysqlTable(functions.isMonth(args[0])) + date.getFullYear();
                connection.query(`SHOW COLUMNS FROM messages`, function (err, result) {
                    if (err) throw err;
                    for (let i = 0; i < result.length; i++) {
                        if (result[i].Field === columnName) {
                            bulion = true;
                            break;
                        }
                    }
                    if (bulion === false) {
                        anotherBoolean = false;
                        return message.channel.send(localization.top_wrong_column)
                    } else {
                        connection.query(`SELECT SUM(${columnName}) as messCount FROM messages`, function (err, result) {
                            if (err) throw err;
                            anotherBoolean = true;
                            return;
                        });
                    }
                    return;
                });
            } 
            value = 1;
            columnExist = true;
        } else if (args[0]&&functions.isMonth(args[0])===false) {
            columnExist=false;
            return message.channel.send(localization.top_wrong_column)
        } else {
            columnName = functions.createMysqlTable((date.getMonth() + 1)) + date.getFullYear();
            value = 0;
            columnExist = true;
        }
        const delay = (msec) => new Promise((resolve) => setTimeout(resolve, msec));
        await delay(500)
        let usersInMonth = 0;
        connection.query(`SELECT COUNT(${columnName}) as usersMonthly FROM messages WHERE ${columnName} IS NOT NULL`, function(err, result) {
            if (anotherBoolean === false) return;
            if (err) throw err;
            usersInMonth = result[0].usersMonthly;
            return;
        });
        connection.query(`SELECT SUM(${columnName}) as messCount, COUNT(id) as idNum FROM messages`, function (err, result) {
            //poniższa linijka jest w po aby w przypadku podania złego miesiąca nie wywalił się bot tylko zwrócił wiadomość
            if (anotherBoolean === false) return;
            if (bulion === false && (args[0] && args[0] !== "place") && (args[0] && args[0] !== "find") && (args[0] && functions.isMonth(args[0]) !== "all") && isNaN(args[0])) return;
            if (err) throw err;
            usersCount = result[0].idNum;
            embed.setFooter(localization.top_users_in_month + usersInMonth+localization.top_all_users + usersCount + localization.top_all_messages + result[0].messCount + localization.top_timestamp + functions.today() + " | " + functions.time());
            if (!args[0] || (!isNaN(functions.isMonth(args[0])) && args.length === 1 && functions.isMonth(args[0]) !== false) || (functions.isMonth(args[0]) === "all" && args.length === 1) || (columnExist===true&&args.length===1&&isNaN(args[0]))) {
                if (usersCount < 10) {
                    number = usersCount;
                } else {
                    number = 10;
                }
                if (args[0]&&!isNaN(args[0].slice(-4))&&isNaN(args[0])) {
                    embed.setTitle(localization.top_top + number + localization.top_of +functions.replaceMonth2(functions.sqlMonth(args[0]))+" " +functions.sqlYear(args[0]))
                } else if (args[0] && functions.isMonth(args[0]) === "all") {
                    embed.setTitle(localization.top_top + number + localization.top_top_all_time);
                } else if (args[0] && functions.isMonth(args[0]) !== "all" && functions.isMonth(args[0]) !== "false") {
                    embed.setTitle(localization.top_top + number + localization.top_top_users_of + functions.replaceMonth2(args[0]));
                } else {
                    embed.setTitle(localization.top_top + number + localization.top_top_this_month);
                }
                if (args[0] && functions.isMonth(args[0]) !== false) {
                    order_by = columnName;
                } else if (args[0] && functions.isMonth(args[0]) === "all") {
                    order_by = "allMessages";
                } else {
                    order_by = columnName;
                }
                connection.query(`SELECT id, allMessages, ${columnName} FROM messages ORDER BY ${order_by} DESC limit ${number}`, function (err, result) {
                    if (err) throw err;
                    for (let i = 0; i < number; i++) {
                        if (result[i][columnName]===0) {
                            if (args[0]&&!isNaN(args[0].slice(-4))&&isNaN(args[0])) {
                                embed.setTitle(localization.top_top + i + localization.top_of +functions.replaceMonth2(functions.sqlMonth(args[0]))+" " +functions.sqlYear(args[0]))
                            } else if (args[0] && functions.isMonth(args[0]) === "all") {
                                embed.setTitle(localization.top_top + i + localization.top_top_all_time);
                            } else if (args[0] && functions.isMonth(args[0]) !== "all" && functions.isMonth(args[0]) !== "false") {
                                embed.setTitle(localization.top_top + i  + localization.top_top_users_of + functions.replaceMonth2(args[0]));
                            } else {
                                embed.setTitle(localization.top_top + i  + localization.top_top_this_month);
                            }
                            break;
                        }
                        embed.addField(localization.top_place + (i + 1), localization.top_monkey + result[i].id + localization.top_with + result[i][columnName] + localization.top_messages);
                    }
                    return message.channel.send(embed);
                });
            } else if (args[0 + value] === "place") {
                if (!args[1 + value]) return message.channel.send(localization.top_place_not_specified);
                if (isNaN(args[1 + value])) return message.channel.send(localization.top_number_not_text);
                if (args[1 + value] > result[0].idNum) return message.channel.send(localization.top_too_high);
                let place = args[1 + value] - 1;
                if (args[0]&&!isNaN(args[0].slice(-4))&&isNaN(args[0])) {
                    embed.setTitle(localization.top_top + args[1 + value] +" " +functions.replaceMonth2(functions.sqlMonth(args[0]))+" " +functions.sqlYear(args[0]))
                } else if (!isNaN(functions.isMonth(args[0])) && functions.isMonth(args[0]) !== false) {
                    embed.setTitle(localization.top_top + args[1 + value] + localization.top_users_in + functions.replaceMonth2(args[0]));
                } else if (functions.isMonth(args[0]) === "all") {
                    embed.setTitle(localization.top_top + args[1 + value] + localization.top_users_of_all_time);
                } else {
                    embed.setTitle(localization.top_top + args[1 + value] + localization.top_users_this_month);
                }
                connection.query(`SELECT id, ${columnName} FROM messages ORDER BY ${columnName} DESC`, function (err, result) {
                    if (err) throw err;
                    if (result[place][columnName]===0) return message.channel.send(new Discord.MessageEmbed().setTitle(localization.top_error).setColor("ORANGE").setDescription(localization.top_not_many_users))
                    embed.addField(localization.top_place + args[1 + value], localization.top_monkey + result[place].id + localization.top_takes_with + result[place][columnName] + localization.top_messages);
                    return message.channel.send(embed);
                });
            } else if (args[0 + value] === "find") {
                let personID = "";
                let bool = false;
                if (message.mentions.members.first()) bool = true;
                if (!args[1 + value]) return message.channel.send(localization.top_person_not_specified);
                if (args[1 + value]) {
                    if (isNaN(args[1 + value]) && bool === false) {
                        return message.channel.send(localization.top_only_number);
                    } else if (args[1 + value].length !== 18 && bool === false) {
                        return message.channel.send(localization.top_18_char_long);
                    } else if (!message.guild.members.cache.get(args[1 + value]) && bool === false) {
                        return message.channel.send(localization.top_user_not_found);
                    } else {
                        if (bool === true) {
                            personID = message.mentions.users.first().id;
                        } else {
                            personID = args[1 + value];
                        }
                        number = 0;
                    }
                } else {
                    personID = message.author.id;
                    number = 1;
                }
                let user = message.guild.members.cache.get(personID);
                if (args[0]&&!isNaN(args[0].slice(-4))&&isNaN(args[0])) {
                    embed.setTitle(localization.top_top + user.user.username + " " +functions.replaceMonth2(functions.sqlMonth(args[0]))+" " +functions.sqlYear(args[0]))
                } else if (!isNaN(functions.isMonth(args[0])) && functions.isMonth(args[0]) !== false) {
                    embed.setTitle(localization.top_user + user.user.username + " " + functions.replaceMonth2(args[0]));
                } else if (functions.isMonth(args[0]) === "all") {
                    embed.setTitle(localization.top_user + user.user.username + localization.top_of_all);
                } else {
                    embed.setTitle(localization.top_user + user.user.username + localization.top_in_this_month);
                }
                connection.query(`SELECT id, ${columnName} FROM messages ORDER BY ${columnName} DESC`, function (err, result) {
                    if (err) throw err;
                    let place = 0;
                    let kolejnaZmienna = true;
                    for (let i = 0; i < result.length; i++) {
                        if (result[i].id === personID) {
                            place = i;
                            kolejnaZmienna = false;
                        } else {
                        }
                    }
                    if (kolejnaZmienna === true) return message.channel.send(localization.top_nothing_written);
                    if (result[place][columnName]===0) return message.channel.send(new Discord.MessageEmbed().setColor("ORANGE").setTitle(localization.top_error).setDescription(localization.top_nothing_written_in_month))
                    embed.addField(localization.top_place + (place + 1) + localization.top_from + usersCount, localization.top_monkey + result[place].id + localization.top_takes_with + result[place][columnName]);
                    return message.channel.send(embed);
                });
            } else {
                let number = 0;
                if (isNaN(args[0 + value])) return message.channel.send(localization.top_place_find);
                if (args[0 + value] > result[0].idNum) {
                    return message.channel.send(localization.top_too_high_number);
                } else {
                    number = args[0 + value];
                }
                if (args[0]&&!isNaN(args[0].slice(-4))&&isNaN(args[0])) {
                    embed.setTitle(localization.top_top + number + localization.top_top_users_of + functions.replaceMonth2(functions.sqlMonth(args[0]))+" " +functions.sqlYear(args[0]))
                } else if (args[0] && functions.isMonth(args[0]) === "all") {
                    embed.setTitle(localization.top_top + number + localization.top_top_all_time);
                } else if (args[0] && isNaN(args[0]) && functions.isMonth(args[0]) !== "all" && functions.isMonth(args[0]) !== "false") {
                    embed.setTitle(localization.top_top + number + localization.top_top_users_of + functions.replaceMonth2(args[0]));
                } else {
                    embed.setTitle(localization.top_top + number + localization.top_top_this_month);
                }
                if (args[0] && functions.isMonth(args[0]) !== false) {
                    order_by = columnName;
                } else if (args[0] && functions.isMonth(args[0]) === "all") {
                    order_by = "allMessages";
                } else {
                    order_by = columnName;
                }
                connection.query(`SELECT id, ${columnName} FROM messages ORDER BY ${columnName} DESC limit ${number}`, function (err, result) {
                    if (err) throw err;
                    for (let i = 0; i < number; i++) {
                        if (result[i][columnName]===0) {
                            if (args[0]&&!isNaN(args[0].slice(-4))&&isNaN(args[0])) {
                                embed.setTitle(localization.top_top + i + localization.top_top_users_of + functions.replaceMonth2(functions.sqlMonth(args[0]))+" " +functions.sqlYear(args[0]))
                            } else if (args[0] && functions.isMonth(args[0]) === "all") {
                                embed.setTitle(localization.top_top + i + localization.top_top_all_time);
                            } else if (args[0] && isNaN(args[0]) && functions.isMonth(args[0]) !== "all" && functions.isMonth(args[0]) !== "false") {
                                embed.setTitle(localization.top_top + i + localization.top_top_users_of + functions.replaceMonth2(args[0]));
                            } else {
                                embed.setTitle(localization.top_top + i + localization.top_top_this_month);
                            }
                            message.channel.send(localization.top_too_much_users);
                            break;
                        }
                        embed.addField(localization.top_place + (i + 1), localization.top_monkey + result[i].id + localization.top_with + result[i][columnName] + localization.top_messages);
                    }
                    return message.channel.send(embed);
                });
            }
            return;
        });
    }
}