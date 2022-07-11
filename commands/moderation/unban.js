const Discord = require('discord.js');
const fs = require("fs");
const functions = require("../../functions.js");
const mysql = require("mysql");
module.exports = {
    name: "unban",
    aliases: [],
    category: "moderation",
    description: "Removing ban",
    usage: "<mention/userID>",
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
        if (!message.mentions.members.first()) return message.channel.send({content:"Nie oznaczono użytkownika"})
        personID = message.mentions.users.first().id;
        connection.query(`SELECT * FROM bans WHERE bannedPersonID = '${personID}'`, (err, result) => {
            if (err) throw err;
            if (result.length === 0) return message.channel.send({content: "This person has not been found in database, contact @iThomash#0209 if you are sure that you make everything good"});
            connection.query(`DELETE FROM bans WHERE bannedPersonID = '${personID}'`, (err, result) => {
                if (err) throw err;
                message.guild.fetchBans().then(bans => {
                    if (bans.size == 0) return message.channel.send({content:"Nikt nie jest zbanowany :/"});
                    let bUser = bans.find(b => b.user.id == personID);
                    if (!bUser) return message.channel.send({content:"Nie znaleziono użytkownika"});
                    message.guild.members.unban(bUser.user);
                    const embed = new Discord.MessageEmbed()
                        .setTitle("Pomyślnie odbanowano")
                        .setDescription(`Pomyślnie odbanowałeś <@${args[0]}>!`)
                        .setColor("ORANGE");
                    message.channel.send({embeds: [embed]});
                });
            });
        });
    }
}