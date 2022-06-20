const Discord = require('discord.js');
const fs = require("fs");
const mysql = require("mysql");
const functions = require("../../functions.js");
module.exports = {
    name: "permban",
    aliases: [],
    category : "moderation",
    description: "Banning players lifetime",
    usage: "<mention/userID> [reason]",
    permission: 5,
    run: async (client, message, args) => {
        const localization = require(fs.readFileSync("./language/language.txt").toString().split("\n")[1]);
        const settings = require("../../settings.json");
        let connection = mysql.createConnection({
            host: settings.mySQLhost,
            user: settings.mySQLuser,
            database: "xskyblock database"
        })
        let personID = "";
        let bool = false;
        if (message.mentions.members.first()) bool = true;
        if (!args[0]) return message.channel.send(localization.permban_user_not_specified);
        if (args[0]) {
            if (isNaN(args[0]) && bool === false) {
                return message.channel.send(localization.permban_is_is_a_number);
            } else if (args[0].length !== 18 && bool === false) {
                return message.channel.send(localization.permban_18_char);
            } else if (!message.guild.members.cache.get(args[0]) && bool === false) {
                personID = args[0];
                message.channel.send(localization.permban_person_not_found);
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
        
        let reason = "";
        if (args.length===1) {
            reason = localization.permban_life_is_too_short;
        } else {
            for (let i =1; i<args.length; i++) {
                reason = reason+args[i]+" ";
            }
        }
        connection.query(`SELECT * FROM bans WHERE bannedPersonID = '${personID}'`, function(err, result) {
            if (CanIBeBanned === false) return message.channel.send(localization.permban_banproof);
            if (err) throw err;
            if (result.length===1) { 
                return message.channel.send(localization.permban_already_banned);
            } else {
                let isBanned = false
                if (user) isBanned = true
                let insertValues = [personID, true, functions.today2() + " " + functions.time(), null, message.author.id, reason, isBanned];
                const embed = new Discord.MessageEmbed();
                connection.query(`INSERT INTO bans (bannedPersonID, isPermament, banTimestamp, bannedUntil, bannedBy, reason, isBanned) VALUES (?)`, [insertValues], function(err, result) {
                    if (err) throw err;
                    let values = [message.author.id, "ban", functions.today2() + " " + functions.time()]
                    connection.query(`INSERT INTO counter (userID, action, timestamp) VALUES (?)`, [values], function(err,result) {
                        if (err) throw err;
                        return;
                    });
                    if (!user) {
                        embed.setTitle(localization.permban_permban).setColor("ORANGE").addField(localization.permban_banned_user, localization.permban_monkey+personID+localization.permban_ending).addField(localization.permban_by, message.author.tag).addField(localization.permban_for, localization.permban_until).addField(localization.permban_date, new Date()).addField(localization.permban_reason, reason);
                        return client.channels.cache.get(settings.punishmentChannel).send(embed);
                    } else {
                        embed.setTitle(localization.permban_permban).setColor("ORANGE").addField(localization.permban_banned_user, localization.permban_monkey+personID+localization.permban_ending).addField(localization.permban_by, message.author.tag).addField(localization.permban_for, localization.permban_until).addField(localization.permban_date, new Date()).addField(localization.permban_reason, reason);
                        user.ban({reason: reason});
                        return client.channels.cache.get(settings.punishmentChannel).send(embed);
                    }
                });
            }
        });
    }
}