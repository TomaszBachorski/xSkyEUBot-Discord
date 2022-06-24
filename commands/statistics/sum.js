const Discord = require('discord.js');
const fs = require("fs");
const functions = require("../../functions.js");
const mysql = require("mysql");
module.exports = {
    name: "sum",
    aliases: ["allmessages"],
    category: "statistics",
    description: "Sums all messages",
    usage: "[month/all]",
    permission: 10,
    run: async (client, message, args) => {
        const settings = require("../../settings.json");
        const embed = new Discord.MessageEmbed().setColor("ORANGE");
        let columnName = "";
        let date = new Date();
        let validMonth = false;
        let connection = mysql.createConnection({
            host: settings.mySQLhost,
            user: settings.mySQLuser,
            password: settings.mySQLpassword,
            database: "xskyblock database"
        });
        let bulion = false;
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
                    return message.channel.send({ content: "Kolumna nie istnieje" })
                } else {
                    connection.query(`SELECT SUM(${columnName}) as messCount FROM messages`, (err, result) => {
                        if (err) throw err;
                        anotherBoolean = true;
                        return;
                    });
                }
                embed.setTitle(`Wszystkie wiadomości wysłane w ${args[0]}`)
                validMonth = true;
            });
        } else if (args[0] && functions.isMonth(args[0]) === "all") {
            embed.setTitle("Wszystkie wiadomości wysłane w całej egzystencji serwera :)");
            columnName = "allMessages";
        } else if (args[0] && !isNaN(functions.isMonth(args[0]))) {
            columnName = functions.createMysqlTable(functions.isMonth(args[0])) + date.getFullYear();
            connection.query("SHOW COLUMNS FROM messages", (err, result) => {
                if (err) throw err;
                for (let i = 0; i < result.length; i++) {
                    if (result[i].Field === columnName) {
                        validMonth = true;
                    } else {
                    }
                }
            });
            embed.setTitle(`Wszystkie wiadomości wysłane ${args[0]}`);
        } else {
            if (args[0]) {
                columnName = functions.createMysqlTable(functions.isMonth(args[0])) + date.getFullYear();
            } else {
                columnName = functions.createMysqlTable((date.getMonth() + 1)) + date.getFullYear();
            }
            connection.query("SHOW COLUMNS FROM messages", (err, result) => {
                if (err) throw err;
                for (let i = 0; i < result.length; i++) {
                    if (result[i].Field === columnName) {
                        validMonth = true;
                    }
                }
            });
            embed.setTitle("Wszystkie wiadomości wysłane w tym miesiącu");
        }
        const delay = (msec) => new Promise((resolve) => setTimeout(resolve, msec));
        await delay(500)
        connection.query(`SELECT SUM(${columnName}) as allMessages FROM messages`, (err, result) => {
            if (validMonth === false && args[0] !== "all" && (!isNaN(functions.isMonth(args[0])))) return message.channel.send({ content: "W miesiącu, który podano nie napisano nic lub zrobiłeś literówkę" });
            if (err) throw err;
            embed.setDescription(`Zostało wysłane ${(result[0].allMessages + 1)} wiadomości`);
            return message.channel.send({ embeds: [embed] });
        });
        return;
    }
}