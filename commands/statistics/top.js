const Discord = require('discord.js');
const fs = require("fs");
const functions = require("../../functions.js");
const mysql = require("mysql");
module.exports = {
    name: "top",
    aliases: [],
    category: "statistics",
    description: "Shows many things from db about messages",
    usage: "[month] [find/top] [number]",
    permission: 10,
    run: async (client, message, args) => {
        const settings = require("../../settings.json");
        let connection = mysql.createConnection({
            host: settings.mySQLhost,
            user: settings.mySQLuser,
            password: settings.mySQLpassword,
            database: settings.mySQLdatabase
        });
        const embed = new Discord.MessageEmbed().setColor("ORANGE");
        let value = 0;
        let columnName = "";
        let date = new Date();
        let bulion = false; //sprawdzenie czy kolumna istnieje, jeśli tak =true
        let usersCount = 0;
        let anotherBoolean = true; //zmienna do późniejszego sprawdzenia czy kolumna istnieje
        let number = 1;
        let order_by = "";
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
                    anotherBoolean = false;
                    return message.channel.send({ content: "Ten miesiąc nie został jesczcze utworzony lub nic w nim nie napisano" })
                } else {
                    connection.query(`SELECT SUM(${columnName}) as messCount FROM messages`, (err, result) => {
                        if (err) throw err;
                        anotherBoolean = true;
                    });
                }
                columnExist = true;
                return;
            });
            value = 1;
        } else if (args[0] && functions.isMonth(args[0]) !== NaN) {
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
                        return message.channel.send({ content: "Ten miesiąc nie został jesczcze utworzony lub nic w nim nie napisano" })
                    } else {
                        connection.query(`SELECT SUM(${columnName}) as messCount FROM messages`, (err, result) => {
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
        } else if (args[0] && functions.isMonth(args[0]) === false) {
            columnExist = false;
            return message.channel.send({ content: "Ten miesiąc nie został jesczcze utworzony lub nic w nim nie napisano" })
        } else {
            columnName = `${new Date().toLocaleDateString("en", {month: 'long'})}${new Date().getFullYear()}`;
            value = 0;
            columnExist = true;
        }
        const delay = (msec) => new Promise((resolve) => setTimeout(resolve, msec));
        await delay(1000)
        let usersInMonth = 0;
        connection.query(`SELECT COUNT(${columnName}) as usersMonthly FROM messages WHERE ${columnName} IS NOT NULL`, (err, result) => {
            if (anotherBoolean === false) return;
            if (err) throw err;
            usersInMonth = result[0].usersMonthly;
            return;
        });
        connection.query(`SELECT SUM(${columnName}) as messCount, COUNT(id) as idNum FROM messages`, (err, result) => {
            //poniższa linijka jest w po aby w przypadku podania złego miesiąca nie wywalił się bot tylko zwrócił wiadomość
            if (anotherBoolean === false) return;
            if (bulion === false && (args[0] && args[0] !== "find") && (args[0] && functions.isMonth(args[0]) !== "all") && isNaN(args[0])) return;
            if (err) throw err;
            usersCount = result[0].idNum;
            embed.setFooter({ text: `Użytkowników w okresie: ${usersInMonth}\nWszyscy użytkownicy: ${usersCount}\nWszystkie wiadomości: ${result[0].messCount}\nStan na: ${functions.today()} | ${functions.time()}` });
            if (!args[0] || (!isNaN(functions.isMonth(args[0])) && args.length === 1 && functions.isMonth(args[0]) !== false) || (functions.isMonth(args[0]) === "all" && args.length === 1) || (columnExist === true && args.length === 1 && isNaN(args[0]))) {
                if (usersCount < 10) {
                    number = usersCount;
                } else {
                    number = 1;
                }
                if (args[0] && !isNaN(args[0].slice(-4)) && isNaN(args[0])) {
                    embed.setTitle(`Top ${number} użytkowników ${args[0]}`)
                } else if (args[0] && functions.isMonth(args[0]) === "all") {
                    embed.setTitle(`Top ${number} użytkowników łącznie`);
                } else if (args[0] && functions.isMonth(args[0]) !== "all" && functions.isMonth(args[0]) !== "false") {
                    embed.setTitle(`Top ${number} użytkowników ${args[0]}`);
                } else {
                    embed.setTitle(`Top ${number} użytkowników w tym miesiącu`);
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
                        if (result[i][columnName] === 0) {
                            if (args[0] && !isNaN(args[0].slice(-4)) && isNaN(args[0])) {
                                embed.setTitle(`Top ${i} użytkowników ${args[0]}`)
                            } else if (args[0] && functions.isMonth(args[0]) === "all") {
                                embed.setTitle(`Top ${i} użytkowników łącznie`);
                            } else if (args[0] && functions.isMonth(args[0]) !== "all" && functions.isMonth(args[0]) !== "false") {
                                embed.setTitle(`Top ${i} użytkowników ${args[0]})`);
                            } else {
                                embed.setTitle(`Top ${i} użytkowników w tym miesiącu`);
                            }
                            break;
                        }
                        embed.addField(`Miejsce ${(i + 1)}`, `<@${result[i].id}> z ${result[i][columnName]} wiadomościami`);
                    }
                    return message.channel.send({embeds: [embed]});
                });
            } else if (args[0 + value] === "find") {
                let personID = "";
                if (!message.mentions.members.first()) return message.channel.send({ content: "Nie oznaczono użytkownika" });
                if (!args[1 + value]) return message.channel.send({ content: "Osoba nie została określona" });
                personID = message.mentions.users.first().id;
                let user = message.guild.members.cache.get(personID);
                if (args[0] && !isNaN(args[0].slice(-4)) && isNaN(args[0])) {
                    embed.setTitle(`Top ${user.user.username} ${args[0]}`)
                } else if (!isNaN(functions.isMonth(args[0])) && functions.isMonth(args[0]) !== false) {
                    embed.setTitle(`Top ${user.user.username} ${args[0]}`);
                } else if (functions.isMonth(args[0]) === "all") {
                    embed.setTitle(`Top ${user.user.username} łącznie`);
                } else {
                    embed.setTitle(`Top ${user.user.username} w tym miesiącu`);
                }
                connection.query(`SELECT id, ${columnName} FROM messages ORDER BY ${columnName} DESC`, (err, result) => {
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
                    if (kolejnaZmienna === true) return message.channel.send({ content: "Ta osoba nie napsiała nic w danym okresie" });
                    if (result[place][columnName] === 0) return message.channel.send({ embeds: [new Discord.MessageEmbed().setColor("ORANGE").setTitle("BŁĄD").setDescription("Ta osoba nie napisała nic w podanym przez ciebie okresie")] })
                    embed.addField(`Miejsce ${(place + 1)} z ${usersCount}`, `<@${result[place].id}> zajmuje to miesjce z ${result[place][columnName]}`);
                    return message.channel.send({ embeds: [embed] });
                });
            } else {
                let number = 1;
                if (isNaN(args[0 + value])) return message.channel.send({ content: "Argument musi być liczbą lub find" });
                if (args[0 + value] > result[0].idNum) {
                    return message.channel.send({ content: "Nie ma tak wielu użytkowników w bazie danych" });
                } else {
                    number = args[0 + value];
                }
                if (args[0] && !isNaN(args[0].slice(-4)) && isNaN(args[0])) {
                    embed.setTitle(`Top ${number} użytkowników ${args[0]}`)
                } else if (args[0] && functions.isMonth(args[0]) === "all") {
                    embed.setTitle(`Top ${number} użytkowników łącznie`);
                } else if (args[0] && isNaN(args[0]) && functions.isMonth(args[0]) !== "all" && functions.isMonth(args[0]) !== "false") {
                    embed.setTitle(`Top ${number} użytkowników ${args[0]}`);
                } else {
                    embed.setTitle(`Top ${number} użytkowników w tym miesiącu`);
                }
                if (args[0] && functions.isMonth(args[0]) !== false) {
                    order_by = columnName;
                } else if (args[0] && functions.isMonth(args[0]) === "all") {
                    order_by = "allMessages";
                } else {
                    order_by = columnName;
                }
                connection.query(`SELECT id, ${columnName} FROM messages ORDER BY ${columnName} DESC limit ${number}`, (err, result) => {
                    if (err) throw err;
                    for (let i = 0; i < number; i++) {
                        if (result[i][columnName] === 0) {
                            if (args[0] && !isNaN(args[0].slice(-4)) && isNaN(args[0])) {
                                embed.setTitle(`Top ${i} użytkowników${args[0]}`)
                            } else if (args[0] && functions.isMonth(args[0]) === "all") {
                                embed.setTitle(`Top ${i} użytkowników łącznie`);
                            } else if (args[0] && isNaN(args[0]) && functions.isMonth(args[0]) !== "all" && functions.isMonth(args[0]) !== "false") {
                                embed.setTitle(`Top ${i} użytkowników ${args[0]}`);
                            } else {
                                embed.setTitle(`Top ${i} użytkowników w tym miesiącu`);
                            }
                            message.channel.send({ content: "Podano zbyt dużą ilość osób(ale i tak wyślę :)" });
                            break;
                        }
                        embed.addField(`Miejsce ${(i + 1)}`, `<@${result[i].id}> z ${result[i][columnName]} wiadomościami`);
                    }
                    return message.channel.send({ embeds: [embed] });
                });
            }
            return;
        });
    }
}