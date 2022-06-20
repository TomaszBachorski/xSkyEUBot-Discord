const fs = require("fs");
const Discord = require('discord.js');
const mysql = require("mysql");
module.exports = {
    name: "setpermission",
    aliases: ["setpermision", "setpermissions", "setpermisions"],
    category: "bot",
    description: "Sets user permissions to use bot",
    usage: "<userID/userMention> <permissionLevel>",
    permission: 10,
    run: async (client, message, args) => {
        const settings = require("../../settings.json");
        let connection = mysql.createConnection({
            host: settings.mySQLhost,
            user: settings.mySQLuser,
            database: "xskyblock database"
        });
        let personID = "";
        let bool = false;
        if (!message.mentions.members.first()) return message.channel.send({content: "Nie oznaczono użytkownika"})
        personID = message.mentions.users.first().id;
        if (!args[1]) return message.channel.send({content: "Nie podano poziomu permisji"})
        if (isNaN(args[1])) return message.channel.send({content: "Poziom permisji musi być liczbą"})
        if (args[1]<0 || args[1]>10) return message.channel.send({content: "Poziom permisji należy do przedziału <0, 10>"})
        connection.query(`UPDATE users SET permissions = ${args[1]} WHERE id = ${personID}`, function(err, result) {
            if (err) throw err;
            return message.channel.send({embeds: [new Discord.MessageEmbed().setDescription(`Pomyślnie zmieniono poziom permisji dla <@${personID}> na ${args[1]}`).setColor('#0099ff')]})
        });
    }
}