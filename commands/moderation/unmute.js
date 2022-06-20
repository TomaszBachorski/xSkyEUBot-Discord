const Discord = require('discord.js');
const fs = require("fs");
const mysql = require("mysql");
module.exports = {
    name: "unmute",
    aliases: [],
    category : "moderation",
    description: "Removing mute",
    usage: "<mention/userID>",
    permission: 5,
    run: async (client, message, args) => {
        const settings = require("../../settings.json");
        let connection = mysql.createConnection({
            host: settings.mySQLhost,
            user: settings.mySQLuser,
            database: "xskyblock database"
        });
        
        let muterole = message.guild.roles.cache.find(role => role.id === settings.muteRole);
        if (!muterole) return message.channel.send({content: "Rola do wyciszania nie została odnaleziona"});

        if (!args[0]) return message.channel.send({content: "Nie podano osoby"});
        let personID = "";
        if (!message.mentions.members.first()) return message.channel.send({content: "Nie oznaczono użytkownika!"});
        personID = message.mentions.users.first().id;
        let user = message.guild.members.cache.get(personID);
        const embed = new Discord.MessageEmbed();
        connection.query(`SELECT * FROM mutes WHERE mutedPersonID = '${personID}'`, (err, result) => {
            if (err) throw err;
            if (result.length===0) {
                return message.channel.send({embeds: [new Discord.MessageEmbed().setTitle("BŁĄD").setColor("RED").setDescription("Ta osoba nie jest wyciszona")]})
            } else {
                connection.query(`DELETE FROM mutes WHERE mutedPersonID = '${result[0].mutedPersonID}'`, (err, result) => {
                    if (err) throw err;
                    embed.setColor("ORANGE").setTitle("Odciszono pomyślnie").setDescription(`Zostałeś odciszony przez ${message.author.username}.`).setTimestamp().setFooter({text: "Ta wiadomość została wysłana automatycznie"});
                    if (!user) {
                        message.channel.send({embeds: [new Discord.MessageEmbed().setDescription("Użytkownik nie był dostępny na serwerze, ale i tak usunąłem wyciszenie :)").setColor("GREEN").setTitle("SUKCES")]})
                    } else {
                        message.channel.send({embeds: [new Discord.MessageEmbed().setDescription(`Pomyślnie odciszyłeś <@${personID}>.`).setTitle("SUKCES").setColor("GREEN")]});
                        message.guild.members.cache.get(personID).roles.remove(settings.muteRole);
                        user.send({embeds: [embed]});
                    }
                    return;
                });
            }
        });
        return;
    }
}