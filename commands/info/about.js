const Discord = require('discord.js');
const fs = require("fs");
module.exports = {
    name: "about",
    aliases: [],
    category : "info",
    description: "Informations about bot",
    usage: "",
    permission: 5,
    run: async (client, message, args) => {
        const settings = require("../../settings.json");
        const embed = new Discord.MessageEmbed()
        .setColor("572386") //dont ask why this color
        .setTitle("**Informacje o mnie**")
        .addField("Właściciel bota:", "<@" + settings.botOwner+">")
        .addField("Wersja bota: ", settings.botVersion)
        .addField("Użycie:", `Aby użyć bota wystarczy wpisać ${settings.prefix}help. Jeśli chcesz się dowiedzieć więcej informacji o komendzie wpisz ${settings.prefix}help nazwaKomendy`)
        .addField("Funkcja:", "Ten bot istnieje z wielu powodów :D");
        message.channel.send({embeds: [embed]});
    }
}