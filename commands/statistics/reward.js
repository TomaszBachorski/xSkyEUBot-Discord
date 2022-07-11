const Discord = require('discord.js');
const fs = require("fs");
const functions = require("../../functions.js");
const mysql = require("mysql");
module.exports = {
    name: "reward",
    aliases: ["rewards"],
    category: "statistic",
    description: "Winners for month",
    usage: "[period] <winners count> <rewards after comma>",
    permission: 10,
    run: async (client, message, args) => {
        const settings = require("../../settings.json");
        let connection = mysql.createConnection({
            host: settings.mySQLhost,
            user: settings.mySQLuser,
            password: settings.mySQLpassword,
            database: settings.mySQLdatabase
        });
        let value = 0;
        let columnName = "";
        let date = new Date();
        let bulion = false;
        let columnExist = false;
        if (args[0] && !isNaN(args[0].slice(-4)) && isNaN(args[0])) {
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
                    return message.channel.send({content: "Ten miesiąc nie został jeszcze utworzony lub nikt nic nie napsiał"})
                } else {
                    connection.query(`SELECT SUM(${columnName}) as messCount FROM messages`, (err, result) => {
                        if (err) throw err;
                        anotherBoolean = true;
                    });
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
        if (!args[0 + value]) return message.channel.send({content: "Nie podano liczby osób, które mają otrzymać nagrodę"});
        if (isNaN(args[0 + value])) return message.channel.send({content: "Liczba zwycięzców musi być liczbą"});
        let winnersCount = args[0 + value];
        const embed = new Discord.MessageEmbed().setColor("ORANGE").setTitle(`NAGRODA DLA TOP ${winnersCount} UŻYTKOWNIKÓW!`);
        connection.query(`SELECT id, ${columnName} FROM messages`, function (err, result) {
            //poniższa linijka jest w po aby w przypadku podania złego miesiąca nie wywalił się bot tylko zwrócił wiadomość
            if (bulion === false && args[0] !== "all" && (!isNaN(functions.isMonth(args[0]))) && isNaN(args[0])) return message.channel.send({content: "Ten miesiąc nie został jeszcze utworzony lub nikt nic nie napsiał"});
            if (err) throw err;
            connection.query(`SELECT SUM(${columnName}) as messCount FROM messages`, function (err, result) {
                if (err) throw err;
                allMessagesSum += result[0].messCount;
            });
            usersCount = result.length;
            if (winnersCount === 0) {
                return message.channel.send({content: "Bruh"})
            } else {
                let rewardsAll = "";
                let str = "";
                rewardsAll = message.content.split(" ");
                rewardsAll = rewardsAll.slice(2 + value)
                for (let i = 0; i < rewardsAll.length; i++) {
                    str += rewardsAll[i] + " ";
                }
                rewardsAll = str.split(", ");
                if (rewardsAll.length < winnersCount || rewardsAll[0] === "") {
                    return message.channel.send({content: "Podałeś zbyt małą liczbę nagród w porównaniu do ilości zwycięzców"});
                } else if (rewardsAll.length > winnersCount) {
                    return message.channel.send({content: "Podano zbyt dużą ilość nagród"})
                } else {
                    connection.query(`SELECT id, ${columnName} FROM messages ORDER BY ${columnName} DESC LIMIT ${winnersCount}`, (err, result) => {
                        if (args[0] && !isNaN(args[0].slice(-4)) && isNaN(args[0])) {
                            embed.setFooter({ text: `Okres: ${columnName}\nWszystkie wiadomości: ${allMessagesSum}\nWszyscy użytkownicy: ${usersCount}\nStan na:  ${functions.today()} | ${functions.time()}`})
                        } else if (args[0] === "all") {
                            embed.setFooter({ text: `Okres: cały okres\nWszystkie wiadomości: ${allMessagesSum}\nWszyscy użytkownicy: ${usersCount}\nStan na:  ${functions.today()} | ${functions.time()}`})
                        } else if (!isNaN(functions.isMonth(args[0])) && functions.isMonth(args[0]) !== false) {
                            embed.setFooter({ text: `Okres: ${columnName}\nWszystkie wiadomości: ${allMessagesSum}\nWszyscy użytkownicy: ${usersCount}\nStan na:  ${functions.today()} | ${functions.time()}`})
                        } else {
                            embed.setFooter({ text: `Okres: ${columnName}\nWszystkie wiadomości: ${allMessagesSum}\nWszyscy użytkownicy: ${usersCount}\nStan na:  ${functions.today()} | ${functions.time()}`});
                        }
                        if (err) throw err;
                        if (winnersCount > result.length) return message.channel.send({content: "Nie ma tak wielu użytkowników w bazie danych"})
                        for (let i = 0; i < winnersCount; i++) {
                            if (result[i][columnName] === null) {
                                message.channel.send({content: "W porównaniu z użytkownikami, którzy wysłali wiadomość w podanym przez ciebie miesiącu(lub nie), podałeś zbyt dużą liczbę zwycięzców"})
                                break;
                            }
                            embed.addField(`Miejsce: ${(i + 1)}`, `<@${result[i].id}> wygrywa ${rewardsAll[i]} z ${result[i][columnName]} wiadomościami.`)
                        }
                        return message.channel.send({embeds: [embed]})
                    });
                }
            }
        });
    }
}