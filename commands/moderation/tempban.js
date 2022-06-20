const Discord = require('discord.js');
const fs = require("fs");
const mysql = require("mysql");
const functions = require("../../functions.js")
module.exports = {
    name: "tempban",
    aliases: [],
    category: "moderation",
    description: "Banning user for a time",
    usage: "<mention/userID> <time> [reason]",
    permission: 5,
    run: async (client, message, args) => {
        const settings = require("../../settings.json");
        let connection = mysql.createConnection({
            host: settings.mySQLhost,
            user: settings.mySQLuser,
            database: "xskyblock database"
        });
        let personID = "";
        if (!message.mentions.members.first()) return message.channel.send({content: "Nie oznaczono użytkownika"});
        personID = message.mentions.users.first().id;
        let user = message.guild.members.cache.get(personID);

        let CanIBeBanned = true;
        connection.query(`SELECT * FROM users WHERE id = ${personID}`, (err, result) => {
            if (err) throw err;
            if (!result) return;
            if (result[0].permissions === 10) return CanIBeBanned = false;
            return CanIBeBanned = true
        });

        if (!args[1]) return message.channel.send({content:"Czas nie został sprecyzowany"});
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
            return message.channel.send({content:"Podano błędny format czasu"});
        }
        if (!timeNumber) return message.channel.send({content:"Podano błedną ilość czasu"});
        if (isNaN(timeNumber)) return message.channel.send({content:"Liczba czasu została błędnie podana"});
        let reason = "";
        if (args.length === 2) {
            reason = "Wykonawca komendy był zbyt zajęty, aby wpisać powód, dla którego zostałeś zbanowany";
        } else {
            for (let i = 2; i < args.length; i++) {
                reason = reason + args[i] + " ";
            }
        }
        connection.query(`SELECT * FROM bans WHERE bannedPersonID = '${personID}'`, (err, result) => {
            if (CanIBeBanned === false) return message.channel.send({content:"Ta osoba jest banoodporna"});
            if (err) throw err;
            if (result.length === 1) {
                return message.channel.send({content:"Ta osoba jest już zbanowana"});
            } else {
                let isBanned = false
                if (user) isBanned = true
                let insertValues = [personID, false, functions.today2() + " " + functions.time(), enddate, message.author.id, reason, isBanned];
                const embed = new Discord.MessageEmbed();
                connection.query(`INSERT INTO bans (bannedPersonID, isPermament, banTimestamp, bannedUntil, bannedBy, reason, isBanned) VALUES (?)`, [insertValues], function (err, result) {
                    if (err) throw err;
                    let values = [message.author.id, "ban", functions.today2() + " " + functions.time()]
                    connection.query(`INSERT INTO counter (userID, action, timestamp) VALUES (?)`, [values], (err, result) => {
                        if (err) throw err;
                        return;
                    });
                    embed.setTitle("~TEMPBAN~").setColor("ORANGE").addField("Zbanowany użytkownik: ", `<@${personID}>`).addField("Zbanowany przez:", message.author.tag).addField("Zbanowany na:", `args[1] +  (Do: ${enddate})`).addField("Data: ", new Date()).addField("Powód: ", reason);
                    if (user) user.ban({ reason: reason });
                    client.channels.cache.get(settings.punishmentChannel).send({embeds: [embed]});
                    return
                });
            }
        });
    }
}