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
            password: settings.mySQLpassword,
            database: settings.mySQLdatabase
        });
        if (args.length === 0) {
            connection.query(`SHOW COLUMNS FROM messages LIKE '%${year}'`, (err, result) => {
                if (err) throw err;
                connection.query(`SELECT Count(id) AS allUsers FROM messages`, (err, result) => {
                    if (err) throw err;
                    allusers = result[0].allUsers;
                });
                for (let i = 0; i < result.length; i++) {
                    monthArray.push(result[i].Field);
                }
                for (let i = 0; i < result.length; i++) {
                    connection.query(`SELECT SUM(${monthArray[i]}) AS ${monthArray[i]} FROM messages`, (err, result) => {
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
                connection.query(`SELECT ID, ${monthsAfterComma} FROM messages WHERE ${monthsAfterAnd} IS NULL`, (err, result) => {
                    if (err) throw err;
                    usersToSubstract = result.length;
                });
                let num = 10;
                if (allusers < 10) {
                    num = allusers;
                }
                connection.query(`SELECT id, ${monthsAfterPlus} as total FROM messages ORDER BY total DESC`, (err, result) => {
                    if (err) throw err;
                    for (let i = 0; i < result.length; i++) {
                        embed.addField(`Miejsce ${(i + 1)}`, `<@${result[i].id}> napisa?? ${result[i].total} wiadomo??ci!`)
                    }
                });
            });
            const delay = (msec) => new Promise((resolve) => setTimeout(resolve, msec));
            await delay(500)
            if (allusers < 10) {
                embed.setTitle(`Top ${allusers} u??ytkownik??w w roku ${year}`);
            } else {
                embed.setTitle(`Top 10 u??ytkownik??w w roku ${year}`);
            }
            embed.setFooter({ text: `U??ytkownik??w w ${year}: ${(allusers - usersToSubstract)}\nU??ytkownicy, kt??rzy napisali cokolwiek: ${allusers}\nWszystkie wiadomo??ci w ${year}: ${messagesNumber}\nStan na: ${functions.today()} | ${functions.time()}` })

            message.channel.send({ embeds: [embed] });
        } else {
            if (args.length > 1 && !isNaN(args[0])) {
                if (args.length === 2) return message.channel.send({ content: "Nie podano nagr??d" });
                if (isNaN(args[1])) return message.channel.send({ content: "Liczba zwyci??zc??w musi by?? liczb??" });
                if (args[0].length !== 4) return message.channel.send({ content: "Kiedy chcesz wynagrodzi?? ludzi musisz poda?? rok" })
                if (isNaN(args[0])) return message.channel.send({ content: "Rok ma 4 znaki" });
                let year = args[0];
                let winnersCount = args[1];
                let rewardsAll = "";
                let str = "";
                rewardsAll = message.content.split(" ");
                rewardsAll = rewardsAll.slice(3)
                for (let i = 0; i < rewardsAll.length; i++) {
                    str += rewardsAll[i] + " ";
                }
                if (rewardsAll.length < winnersCount || rewardsAll[0] === "") return message.channel.send({ content: "Podano za ma??o nagr??d" });
                if (rewardsAll.length > winnersCount) return message.channel.send({ content: "Podano za du??o nagr??d" })

                let bulion = false;
                let anotherBulion = false;
                connection.query(`SHOW COLUMNS FROM messages LIKE '%${year}'`, (err, result) => {
                    if (err) throw err;
                    if (result.length === 0) return bulion = true;
                    if (winnersCount === result.length) return anotherBulion = true;
                    connection.query(`SELECT Count(id) AS allUsers FROM messages`, (err, result) => {
                        if (err) throw err;
                        allusers = result[0].allUsers;
                    });
                    for (let i = 0; i < result.length; i++) {
                        monthArray.push(result[i].Field);
                    }
                    for (let i = 0; i < result.length; i++) {
                        connection.query(`SELECT SUM(${monthArray[i]}) AS ${monthArray[i]} FROM messages`, (err, result) => {
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
                    connection.query(`SELECT ID, ${monthsAfterComma} FROM messages WHERE ${monthsAfterAnd} IS NULL`, (err, result) => {
                        if (err) throw err;
                        usersToSubstract = result.length;
                    });
                    connection.query(`SELECT id, ${monthsAfterPlus} as total FROM messages ORDER BY total DESC`, (err, result) => {
                        if (err) throw err;
                        for (let i = 0; i < winnersCount; i++) {
                            embed.addField(`Miejsce ${(i + 1)}`, `<@${result[i].id}> wygrywa ${rewardsAll[i]} z ${result[i].total} wiadomo??ciami!`)
                        }
                    });
                });
                const delay = (msec) => new Promise((resolve) => setTimeout(resolve, msec));
                await delay(500)
                if (bulion === true) return message.channel.send({content: "Nie znaleziono wiadomo??ci w podanym przez ciebie roku"})
                if (anotherBulion === true) return message.channel.send({content: "Poda??e?? zbyt du???? liczb?? zwyci??zc??w, nie ma tylu nawet w db"})
                if (allusers < 10) embed.setTitle(`Nagroda dla top ${allusers} za rok ${year}`);
                else embed.setTitle(`Top 10 u??ytkownik??w w roku ${year}`);
                embed.setFooter({ text: `U??ytkownik??w w ${year}: ${(allusers - usersToSubstract)}\nU??ytkownicy, kt??rzy napisali cokolwiek: ${allusers}\nWszystkie wiadomo??ci w ${year}: ${messagesNumber}\nStan na: ${functions.today()} | ${functions.time()}` })
                return message.channel.send({embeds: [embed]});
            } else {
                if (isNaN(args[0])) return message.channel.send({content: "NaN"});
                if (args[0].length !== 4) return message.channel.send({content: "Rok ma 4 znaki"});
                year = args[0];
                let bulion = false;
                connection.query(`SHOW COLUMNS FROM messages LIKE '%${year}'`, (err, result) => {
                    if (err) throw err;
                    if (result.length === 0) return bulion = true;
                    connection.query(`SELECT Count(id) AS allUsers FROM messages`, (err, result) => {
                        if (err) throw err;
                        allusers = result[0].allUsers;
                    });
                    for (let i = 0; i < result.length; i++) {
                        monthArray.push(result[i].Field);
                    }
                    for (let i = 0; i < result.length; i++) {
                        connection.query(`SELECT SUM(${monthArray[i]}) AS ${monthArray[i]} FROM messages`, (err, result) => {
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
                    connection.query(`SELECT ID, ${monthsAfterComma} FROM messages WHERE ${monthsAfterAnd} IS NULL`, (err, result) => {
                        if (err) throw err;
                        usersToSubstract = result.length;
                    });
                    let num = 10;
                    if (allusers < 10) {
                        num = allusers;
                    }
                    connection.query(`SELECT id, ${monthsAfterPlus} as total FROM messages ORDER BY total DESC`, (err, result) => {
                        if (err) throw err;
                        for (let i = 0; i < result.length; i++) {
                            embed.addField(`Miejsce ${(i + 1)}`, `<@${+ result[i].id}> napisa?? ${result[i].total} wiadomo??ci!`)
                        }
                    });
                });
                const delay = (msec) => new Promise((resolve) => setTimeout(resolve, msec));
                await delay(500)
                if (bulion === true) return message.channel.send({content: "Nie znaleziono wiadomo??ci w podanym przez ciebie roku"})
                if (allusers < 10) embed.setTitle(`Top ${allusers} u??ytkownik??w w roku ${year}`);
                else embed.setTitle(`Top 10 u??ytkownik??w w roku ${year}`);
                embed.setFooter({ text: `U??ytkownik??w w ${year}: ${(allusers - usersToSubstract)}\nU??ytkownicy, kt??rzy napisali cokolwiek: ${allusers}\nWszystkie wiadomo??ci w ${year}: ${messagesNumber}\nStan na: ${functions.today()} | ${functions.time()}` })
                return message.channel.send({embeds: [embed]});
            }
        }
    }
}