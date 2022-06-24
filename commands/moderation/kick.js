const Discord = require('discord.js');
const fs = require("fs");
const mysql = require("mysql");
const functions = require("../../functions.js")
module.exports = {
    name: "kick",
    aliases: [],
    category: "moderation",
    description: "Kicking users from discord server",
    usage: "<mention/userID> [reason]",
    permission: 5,
    run: async (client, message, args) => {
        const settings = require("../../settings.json");
        let connection = mysql.createConnection({
            host: settings.mySQLhost,
            user: settings.mySQLuser,
            password: settings.mySQLpassword,
            database: "xskyblock database"
        });
        let arguments = "";
        let personID = "";
        if (!args[0]) return message.channel.send({content: "Musisz oznaczyć osobę, którą chcesz wyrzucić lub ta osoba nie jest dostępna na tym serwerze"});
        if (!message.mentions.members.first()) return message.channe.send({content: "Nie oznaczono użytkownika"});
        personID = message.mentions.users.first().id;
        let user = message.guild.members.cache.get(personID);

        if (args.length === 1) arguments = "Wykonawca komendy był zbyt zajęty, aby wpisać powód dla którego zostałeś wyrzucony";
        else {
            for (let i = 1; i < args.length; i++) {
                arguments = arguments + args[i] + " ";
            }
        }

        const embed = new Discord.MessageEmbed()
            .setTimestamp()
            .setDescription("~KICK~")
            .setColor("ORANGE")
            .addField("**Wyrzucony użytkownik:**", `<@${personID}>`)
            .addField("**Wyrzucony przez:**", message.author.username + "#" + message.author.discriminator)
            .addField("**Data:**", new Date())
            .addField("**Powód:**", arguments);
        connection.query(`SELECT * FROM users WHERE id = ${personID}`, (err, result) => {
            if (result[0].permissions === 10) return message.channel.send({content: "Ta osoba jest wyrzucenio-odporna"});
            if (err) throw err;
            if (!result) return;
            message.delete();
            //client.users.cache.get(personID).send(uAreKicked);
            client.channels.cache.get(settings.punishmentChannel).send({embeds: [embed]});
            user.kick();
            let values = [message.author.id, "kick", functions.today2() + " " + functions.time()]
            connection.query(`INSERT INTO counter (userID, action, timestamp) VALUES (?)`, [values], (err, result) => {
                if (err) throw err;
                return;
            });
        });
    }
}