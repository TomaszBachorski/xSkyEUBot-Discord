const fs = require("fs");
const Discord = require('discord.js');
const MojangAPI = require("mojang-api")
module.exports = {
    name: "account",
    aliases: [""],
    category: "info",
    description: "Mojang account information",
    usage: "<account name>",
    permission: 5,
    run: async (client, message, args) => {
        if (!args[0]) return message.channel.send("Nie podano argumentów")
        MojangAPI.uuidAt(args[0], new Date(), function (err, res) {
            if (err) return message.channel.send({embeds: [new Discord.MessageEmbed().setDescription("Ten nick nie jest jeszcze zajęty").setColor("ORANGE").setTimestamp()]})
            MojangAPI.nameHistory(res.id, function (err, res) {
                if (err) return message.channel.send({embeds: [new Discord.MessageEmbed().setDescription("Ten nick nie jest jeszcze zajęty").setColor("ORANGE").setTimestamp()]})
                const embed = new Discord.MessageEmbed()
                    .setColor("ORANGE")
                    .setTimestamp()
                    .setDescription("")
                for (let i = 0; i < res.length; i++) {
                    let name = res[i].name.split("_").join("\\_")
                    if (i === 0) embed.setDescription(`${embed.description} **${name}** - zakupiono nick\n`)
                    else embed.setDescription(`${embed.description}**${name}** ${new Date(res[i].changedToAt)}\n`)
                }
                message.channel.send({ embeds: [embed] })
            })
        });
    }
}