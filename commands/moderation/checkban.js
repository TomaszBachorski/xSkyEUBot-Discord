const Discord = require('discord.js');
const fs = require("fs");
const mysql = require("mysql");
module.exports = {
    name: "checkban",
    aliases: [],
    category : "moderation",
    description: "Checking informations about bans",
    usage: "<mention/userID>",
    permission: 5,
    run: async (client, message, args) => {
        const settings = require("../../settings.json");
        let connection = mysql.createConnection({
            host: settings.mySQLhost,
            user: settings.mySQLuser,
            database: "xskyblock database"
        }); 
        let personID = "";
        let bool = false;
        if (message.mentions.members.first()) bool = true;
        if (!args[0]) return message.channel.send("Użytkownik nie został sprecyzowany");
        if (args[0]) {
            if (isNaN(args[0]) && bool === false) {
                return message.channel.send("ID jest liczbą");
            } else if (args[0].length !== 18 && bool === false) {
                return message.channel.send("ID jest długie na 18 znaków");
            } else if (!message.guild.members.cache.get(args[0]) && bool === false) {
                personID = args[0];
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
        
        connection.query(`SELECT * FROM bans WHERE bannedPersonID = '${personID}'`, (err ,result) => {
            if (err) throw err;
            if (result.length===0) {
                return message.channel.send({content: "Ta osoba nie jest zbanowana"});
            } else {
                let type = "";
                banTimestamp = result[0].banTimestamp;
                if (result[0].isPermament===0)type =  "Tymczasowo, do " + result[0].bannedUntil;
                else type = "Permamentny";
                message.channel.send({embeds: [new Discord.MessageEmbed().setTitle("~CHECKBAN~").setColor("ORANGE")
                .addField("Użytkownik: ", `<@${result[0].bannedPersonID}>`)
                .addField("Zbanowany przez: ", `<@${result[0].bannedBy}>`)
                .addField("Pieczątka czasowa bana:", result[0].banTimestamp)
                .addField("Rodzaj bana:", type).addField("Powód: ", result[0].reason)]});
                return;
            }
        });

    }
}