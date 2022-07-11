const Discord = require('discord.js');
const fs = require("fs");
const mysql = require("mysql");
const functions = require("../../functions.js");
module.exports = {
    name: "permban",
    aliases: [],
    category : "moderation",
    description: "Banning player lifetime",
    usage: "<mention/userID> [reason]",
    permission: 5,
    run: async (client, message, args) => {
        const settings = require("../../settings.json");
        let connection = mysql.createConnection({
            host: settings.mySQLhost,
            user: settings.mySQLuser,
            password: settings.mySQLpassword,
            database: settings.mySQLdatabase
        })
        let personID = "";
        if (!message.mentions.members.first()) return message.channel.send({content: "Musisz oznaczyć osobę"})
        personID = message.mentions.users.first().id;
        let user = message.guild.members.cache.get(personID);

        let CanIBeBanned = true;
        connection.query(`SELECT * FROM users WHERE id = ${personID}`, (err, result) => {
            if (err) throw err;
            if (!result) return;
            if (result[0].permissions===10) return CanIBeBanned=false;
            return CanIBeBanned=true
        });
        
        let reason = "";
        if (args.length===1) {
            reason = "Wykonawca komendy był zbyt zajęty, aby wpisać powód, dla którego zostałeś zbanowany";
        } else {
            for (let i =1; i<args.length; i++) {
                reason = reason+args[i]+" ";
            }
        }
        connection.query(`SELECT * FROM bans WHERE bannedPersonID = '${personID}'`, function(err, result) {
            if (CanIBeBanned === false) return message.channel.send({content: "Ta osoba jest banoodporna"});
            if (err) throw err;
            if (result.length===1) { 
                return message.channel.send({content: "Ta osoba jest już zbanowana"});
            } else {
                let isBanned = false
                if (user) isBanned = true
                let insertValues = [personID, true, functions.today2() + " " + functions.time(), null, message.author.id, reason, isBanned];
                const embed = new Discord.MessageEmbed();
                connection.query(`INSERT INTO bans (bannedPersonID, isPermament, banTimestamp, bannedUntil, bannedBy, reason, isBanned) VALUES (?)`, [insertValues], (err, result) => {
                    if (err) throw err;
                    let values = [message.author.id, "ban", functions.today2() + " " + functions.time()]
                    connection.query(`INSERT INTO counter (userID, action, timestamp) VALUES (?)`, [values], (err,result) => {
                        if (err) throw err;
                        return;
                    });
                    embed.setTitle("~PERMBAN~").setColor("ORANGE").addField("Zbanowany użytkownik: ", `<@${personID}>`).addField("Zbanowany przez: ", `${message.author.tag}`).addField("Zbanowany na: ", "Permamentnie").addField("Data: ", new Date()).addField("Powód: ", reason);
                        
                    if (user) user.ban({reason: reason});
                    client.channels.cache.get(settings.punishmentChannel).send({embeds: [embed]});
                    return;
                });
            }
        });
    }
}