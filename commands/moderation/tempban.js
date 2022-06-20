const Discord = require('discord.js');
const fs = require("fs");
const mysql = require("mysql");
const functions = require("../../functions.js")
module.exports = {
    name: "tempban",
    aliases: [],
    category : "moderation",
    description: "Banning user for a time",
    usage: "<mention/userID> <time> [reason]",
    permission: 5,
    run: async (client, message, args) => {
        const localization = require(fs.readFileSync("./language/language.txt").toString().split("\n")[1]);
        const settings = require("../../settings.json");
        let connection = mysql.createConnection({
            host: settings.mySQLhost,
            user: settings.mySQLuser,
            database: "xskyblock database"
        });
        let personID = "";
        let bool = false;
        if (message.mentions.members.first()) bool = true;
        if (!args[0]) return message.channel.send(localization.tempban_user_not_specified);
        if (args[0]) {
            if (isNaN(args[0]) && bool === false) {
                return message.channel.send(localization.tempban_is_is_a_number);
            } else if (args[0].length !== 18 && bool === false) {
                return message.channel.send(localization.tempban_18_char);
            } else if (!message.guild.members.cache.get(args[0]) && bool === false) {
                personID = args[0];
                message.channel.send(localization.tempban_person_not_found);
            } else {
                if (bool === true) {
                    personID = message.mentions.users.first().id;
                } else {
                    personID = args[0];
                }
            }
        } else {
            personID = message.author.id;
        }
        let user = message.guild.members.cache.get(personID);

        let CanIBeBanned = true;
        connection.query(`SELECT * FROM users WHERE id = ${personID}`, function(err, result) {
            if (err) throw err;
            if (!result) return;
            if (result[0].permissions===10) return CanIBeBanned=false;
            return CanIBeBanned=true
        });
        
        if (!args[1]) return message.channel.send(localization.tempban_time_not_specified);
        let timeUnit = "";
        let enddate ="";
        if (args[1].endsWith("s")) { 
            timeUnit = "seconds";
            timeNumber = args[1].slice(0, -1);
            enddate = new Date(Date.now() + timeNumber * 1000);
        } else if (args[1].endsWith("m")) { 
            timeUnit = "minutes";
            timeNumber = args[1].slice(0, -1);
            enddate = new Date(Date.now() + timeNumber * 60*1000);
        } else if (args[1].endsWith("h")) { 
            timeUnit = "hours";
            timeNumber = args[1].slice(0, -1);
            enddate = new Date(Date.now() + timeNumber * 60*60*1000);
        } else if (args[1].endsWith("d")) { 
            timeUnit = "days";
            timeNumber = args[1].slice(0, -1);
            enddate = new Date(Date.now() + timeNumber * 24*60*60*1000);
        } else if (args[1].endsWith("M")) { 
            timeUnit = "months";
            timeNumber = args[1].slice(0, -1);
            enddate = new Date(Date.now() + timeNumber * 30*24*60*60*1000);
        } else if (args[1].endsWith("y")) {
            timeUnit = "years";
            timeNumber = args[1].slice(0, -1);
            enddate = new Date(Date.now() + timeNumber * 365*24*60*60*1000);
        } else {
            return message.channel.send(localization.tempban_wrong_time_format);
        }
        if (!timeNumber) return message.channel.send(localization.tempban_wrong_time_number);
        if (isNaN(timeNumber)) return message.channel.send(localization.tempban_wrong_time);
        let reason = "";
        if (args.length===2) {
            reason = localization.tempban_life_is_too_short;
        } else {
            for (let i =2; i<args.length; i++) {
                reason = reason+args[i]+" ";
            }
        }
        connection.query(`SELECT * FROM bans WHERE bannedPersonID = '${personID}'`, function(err, result) {
            if (CanIBeBanned === false) return message.channel.send(localization.tempban_banproof);
            if (err) throw err;
            if (result.length===1) { 
                return message.channel.send(localization.tempban_already_banned);
            } else {
                let isBanned = false
                if (user) isBanned = true
                let insertValues = [personID, false, functions.today2() + " " + functions.time(), enddate, message.author.id, reason, isBanned];
                const embed = new Discord.MessageEmbed();
                connection.query(`INSERT INTO bans (bannedPersonID, isPermament, banTimestamp, bannedUntil, bannedBy, reason, isBanned) VALUES (?)`, [insertValues], function(err, result) {
                    if (err) throw err;
                    let values = [message.author.id, "ban", functions.today2() + " " + functions.time()]
                    connection.query(`INSERT INTO counter (userID, action, timestamp) VALUES (?)`, [values], function(err,result) {
                        if (err) throw err;
                        return;
                    });
                    if (!user) {
                        embed.setTitle(localization.tempban_tempban).setColor("ORANGE").addField(localization.tempban_banned_user, localization.tempban_monkey+personID+localization.tempban_ending).addField(localization.tempban_by, message.author.tag).addField(localization.tempban_for, args[1]  + localization.tempban_until + enddate + localization.tempban_until_ending).addField(localization.tempban_date, new Date()).addField(localization.tempban_reason, reason);
                        return client.channels.cache.get(settings.punishmentChannel).send(embed);
                    } else {
                        embed.setTitle(localization.tempban_tempban).setColor("ORANGE").addField(localization.tempban_banned_user, localization.tempban_monkey+personID+localization.tempban_ending).addField(localization.tempban_by, message.author.tag).addField(localization.tempban_for, args[1]  + localization.tempban_until + enddate + localization.tempban_until_ending).addField(localization.tempban_date, new Date()).addField(localization.tempban_reason, reason);
                        user.ban({reason: reason});
                        return client.channels.cache.get(settings.punishmentChannel).send(embed);
                    }
                });
            }
        });
    }
}