const Discord = require('discord.js');
const ping = require('minecraft-server-util');
module.exports = {
    name: "status",
    aliases: [],
    category : "info",
    description: "Informations about server",
    usage: "",
    permission: 5,
    run: async (client, message, args) => {
        const settings = require("../../settings.json");
        ping(settings.serverAddress, settings.port, (error, response) => {
            if (error) throw error;
            console.log(response)
            const embed = new Discord.MessageEmbed()
                .setColor("ORANGE")
                .setTitle("Status serwera")
                .addField("Adres IP: ", `${response.host}`)
                .addField("Wersja serwera: ", `${response.version}`)
                .addField("Graczy online: ", `${response.onlinePlayers}`)
                .addField("Graczy maks.: ", `${response.maxPlayers}`);
            message.channel.send({embeds: [embed]});
        });
    }
}