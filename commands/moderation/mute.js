const Discord = require('discord.js');
const fs = require("fs");
const mysql = require("mysql");
const functions = require('../../functions');
const moment = require("moment");
module.exports = {
    name: "mute",
    aliases: [],
    category: "moderation",
    description: "Muting person for a time",
    usage: "<mention/userID> <time> [reason]",
    permission: 5,
    run: async (client, message, args) => {
        const settings = require("../../settings.json");
        let personID = "";
        let monthLettersIntoNumber = {
            Jan: 1,
            Feb: 2,
            Mar: 3,
            Apr: 4,
            May: 5,
            Jun: 6,
            Jul: 7,
            Aug: 8,
            Sep: 9,
            Oct: 10,
            Nov: 11,
            Dec: 12
        };
        let muterole = message.guild.roles.cache.find(role => role.id === settings.muteRole);
        if (!muterole) return message.channel.send({content: "Rola do wyciszania nie została znaleziona"});
        if (message.mentions.members.first()) bool = true;
        if (!args[0]) return message.channel.send({content: "Nie sprecyzowano konkretnego użytkownika"});
        if (!message.mentions.members.first()) return message.channel.send({content: "Nie oznaczono użytkownika"})
        personID = message.mentions.users.first().id;
        let user = message.guild.members.cache.get(personID);
        let CanIBeMuted = true;
        let connection = mysql.createConnection({
            host: settings.mySQLhost,
            user: settings.mySQLuser,
            password: settings.mySQLpassword,
            database: "xskyblock database"
        });
        connection.query(`SELECT * FROM users WHERE id = ${personID}`, (err, result) => {
            if (err) throw err;
            if (!result) return;
            if (result[0].permissions === 10) return CanIBeMuted = false;
            return CanIBeMuted = true
        });

        if (!args[1]) return message.channel.send({content: "Nie podano czasu"});
        let timeUnit = "";
        let enddate = "";
        if (args[1].endsWith("s")) {
            timeUnit = "seconds";
            timeNumber = args[1].slice(0, -1);
            enddate = new Date(Date.now() + timeNumber * 1000);
        } else if (args[1].endsWith("m")) {
            timeUnit = "minutes";
            timeNumber = args[1].slice(0, -1);
            enddate = new Date(Date.now() + timeNumber * 60 * 1000);
        } else if (args[1].endsWith("h")) {
            timeUnit = "hours";
            timeNumber = args[1].slice(0, -1);
            enddate = new Date(Date.now() + timeNumber * 60 * 60 * 1000);
        } else if (args[1].endsWith("d")) {
            timeUnit = "days";
            timeNumber = args[1].slice(0, -1);
            enddate = new Date(Date.now() + timeNumber * 24 * 60 * 60 * 1000);
        } else if (args[1].endsWith("M")) {
            timeUnit = "months";
            timeNumber = args[1].slice(0, -1);
            enddate = new Date(Date.now() + timeNumber * 30 * 24 * 60 * 60 * 1000);
        } else if (args[1].endsWith("y")) {
            timeUnit = "years";
            timeNumber = args[1].slice(0, -1);
            enddate = new Date(Date.now() + timeNumber * 365 * 24 * 60 * 60 * 1000);
        } else {
            return message.channel.send({content: "Podano błędny format czasu"});
        }
        if (!timeNumber) return message.channel.send({content: "Nie podano ilości czasu"});
        if (isNaN(timeNumber)) return message.channel.send({content: "Liczba czasu została błędnie podana"})

        let reason = "";
        if (args.length === 2) {
            reason = "Wykonawca komendy był zbyt zajęty, aby wpisać powód, dla którego zostałeś wyciszony";
        } else {
            for (let i = 2; i < args.length; i++) {
                reason = reason + args[i] + " ";
            }
        }
        const embed = new Discord.MessageEmbed();
        connection.query(`SELECT * FROM mutes WHERE mutedPersonID = '${user.user.id}'`, (err, result) => {
            if (CanIBeMuted === false) return message.channel.send({content: "Ta osoba nie może zostać wyciszona ponieważ jest wyciszenio-odporna"});
            if (err) throw err;
            if (result.length === 0) {
                mutedUntill = moment().add(timeNumber, timeUnit).calendar();
                let insertValues = [user.user.id, message.author.id, functions.today2() + " " + functions.time(), args[1], enddate, reason];
                enddate = enddate.toString().split(" ");
                enddate = enddate[3] + "-" + monthLettersIntoNumber[enddate[1]] + "-" + enddate[2] + " " + enddate[4];
                connection.query(`INSERT INTO mutes (mutedPersonID, muteBy, muteTimestamp, muteTime, mutedUntil, muteReason) VALUES (?)`, [insertValues], (err, result) => {
                    if (err) throw err;
                    embed.setColor("ORANGE").setTitle("~MUTE~").addField("Wyciszony użytkownik: ", `<@${user.user.id}>`).addField("Wyciszony przez: ", message.author.tag+".").addField("Wyciszony na: ", `${args[1]} (Do: ${enddate})`).addField("Data: ", new Date()+".").addField("Powód: ", reason+".");
                    message.guild.members.cache.get(personID).roles.add(settings.muteRole);
                    let values = [message.author.id, "mute", functions.today2() + " " + functions.time()]
                    connection.query(`INSERT INTO counter (userID, action, timestamp) VALUES (?)`, [values], (err, result) => {
                        if (err) throw err;
                        return;
                    });
                    return client.channels.cache.get(settings.punishmentChannel).send({embeds: [embed]});
                });
                return;
            } else {
                //ta osoba już jest wyciszona
                return message.channel.send({embeds: [embed.setColor("RED").setTitle("BŁĄD").setDescription("Ta osoba jest już wyciszona!")]});
            }
        });
        return;
    }
}