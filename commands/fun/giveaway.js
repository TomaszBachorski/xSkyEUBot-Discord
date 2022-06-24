const Discord = require('discord.js');
const fs = require("fs");
const ms = require('ms');
const mysql = require("mysql");
module.exports = {
    name: "giveaway",
    aliases: [],
    category: "fun",
    description: "Making giveaways",
    usage: "<time> <winners count> <prize>",
    permission: 10,
    run: async (client, message, args) => {
        const settings = require("../../settings.json");
        let connection = mysql.createConnection({
            host: settings.mySQLhost,
            user: settings.mySQLuser,
            password: settings.mySQLpassword,
            database: "xskyblock database"
        });
        if (!args[0]) return message.channel.send({ content: "Czas nie jest sprecyzowany" });
        if (!args[0].endsWith("d") && !args[0].endsWith("h") && !args[0].endsWith("m") && !args[0].endsWith("s")) return message.channel.send({ content: "To nie jest prawidłowy format czasu" });
        if (isNaN(args[0][0])) return message.channel.send({ content: "To nie jest liczba" });
        let giveawayChannel = settings.giveawayChannel;
        if (!args[1]) return message.channel.send({ content: "Nie podano liczby zwycięzców" });
        if (isNaN(args[1])) return message.channel.send({ content: "Liczba zwycięzców musi być liczbą" });
        let winnersCount = args[1];
        if (winnersCount === '0') return message.channel.send({ content: "Musi być ich więcej niż jeden 1", });
        let prize = args.slice(2).join(" ");
        if (!prize) return message.channel.send({ content: "Nie podano nagrody" });
        message.channel.send({ content: `Giveaway rozpocznie się w <#${giveawayChannel}>.` });
        const embed = new Discord.MessageEmbed()
            .setTitle("GIVEAWAY")
            .setDescription(`Host: <@${message.author.id}>\nLiczba zwycięzców: ${winnersCount}\nNagroda: ${prize}\n**Zareaguj 🎉, aby dołączyć do giveawaya!**`)
            .setFooter({text: "Kończy się: "})
            .setTimestamp(Date.now() + ms(args[0]))
            .setColor("ORANGE");
        client.channels.cache.get(giveawayChannel).send({ content: "🎉  GIVEAWAY  🎉" });
        let msg = await client.channels.cache.get(giveawayChannel).send({ embeds: [embed] });
        msg.react("🎉");

        //stworzenie giveaway'a ^
        //wpisanie do bazy \/

        let timeUnit = "";
        let enddate = "";
        if (args[0].endsWith("s")) {
            timeUnit = "seconds";
            timeNumber = args[0].slice(0, -1);
            enddate = new Date(Date.now() + timeNumber * 1000);
        } else if (args[0].endsWith("m")) {
            timeUnit = "minutes";
            timeNumber = args[0].slice(0, -1);
            enddate = new Date(Date.now() + timeNumber * 60 * 1000);
        } else if (args[0].endsWith("h")) {
            timeUnit = "hours";
            timeNumber = args[0].slice(0, -1);
            enddate = new Date(Date.now() + timeNumber * 60 * 60 * 1000);
        } else if (args[0].endsWith("d")) {
            timeUnit = "days";
            timeNumber = args[0].slice(0, -1);
            enddate = new Date(Date.now() + timeNumber * 24 * 60 * 60 * 1000);
        } else if (args[0].endsWith("M")) {
            timeUnit = "months";
            timeNumber = args[0].slice(0, -1);
            enddate = new Date(Date.now() + timeNumber * 30 * 24 * 60 * 60 * 1000);
        } else if (args[0].endsWith("y")) {
            timeUnit = "years";
            timeNumber = args[0].slice(0, -1);
            enddate = new Date(Date.now() + timeNumber * 365 * 24 * 60 * 60 * 1000);
        } else {
            return message.channel.send({ content: "Błedny format czasu" });
        }
        if (!timeNumber) return message.channel.send({ content: "Nie podano ilości czasu" });
        if (isNaN(timeNumber)) return message.channel.send({ content: "Błedny czas" })
        let values = [false, message.author.id, winnersCount, args[0], enddate, prize, null, msg.id];
        connection.query(`INSERT INTO giveaways (hasEnded, creator, numberOfWinners, time, enddate, rewards, winners, messageID) VALUES (?)`, [values], (err, result) => {
            if (err) throw err;
        });
    }
}