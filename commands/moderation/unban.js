const Discord = require('discord.js');
const fs = require("fs");
const functions = require("../../functions.js");
const mysql = require("mysql");
module.exports = {
    name: "unban",
    aliases: [],
    category : "moderation",
    description: "Removing ban",
    usage: "<mention/userID>",
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
        if (!args[0]) return message.channel.send(localization.unban_user_not_specified);
        if (args[0]) {
            if (isNaN(args[0]) && bool === false) {
                return message.channel.send(localization.unban_numbers_only);
            } else if (args[0].length !== 18 && bool === false) {
                return message.channel.send(localization.unban_18_char_long);
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

        connection.query(`SELECT * FROM bans WHERE bannedPersonID = '${personID}'`, function(err, result) {
            if (err) throw err;
            if (result.length===0) {
                return message.channel.send(localization.unban_contact);
            } else {
                connection.query(`DELETE FROM bans WHERE bannedPersonID = '${personID}'`, function(err, result) {
                    if (err) throw err;
                    message.guild.fetchBans().then(bans=> {
                        if (bans.size == 0) return message.channel.send(localization.unban_no_one_banned);
                        let bUser = bans.find(b => b.user.id == personID);
                        if (!bUser) return message.channel.send(localization.unban_not_found);
                        message.guild.members.unban(bUser.user);
                        const embed = new Discord.MessageEmbed()
                        .setTitle(localization.unban_success_title)
                        .setDescription(localization.unban_desc_1 + args[0] + localization.unban_desc_2)
                        .setColor("ORANGE");
                        message.channel.send(embed);
                    });
                });
            }
        });
    }
}