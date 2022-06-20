const Discord = require('discord.js');
const fs = require("fs");
const functions = require("../../functions.js");
const request = require("request")
module.exports = {
    name: "minecraftstatus",
    aliases: ["statusminecraft", "mcst"],
    category: "info",
    description: "Informations about mojang servers",
    usage: "[single]",
    permission: 5,
    run: async (client, message, args) => {
        let time = 3000;
        let serversList = [
            "https://minecraft.net/",
            "https://session.minecraft.net/",
            "https://account.mojang.com/",
            "https://authserver.mojang.com/",
            "https://sessionserver.mojang.com/",
            "https://api.mojang.com/",
            "https://textures.minecraft.net/",
            "https://mojang.com/"
        ];
        const embed = new Discord.MessageEmbed()
            .setColor("#3498db")
            .setTitle("Status serwerów Minecraft")
            .setTimestamp()
            .setDescription("")
            .setFooter({ text: `Prośba przez ${message.author.username}."` });

        request(serversList[0], { timeout: 2000 }, (err, response) => {
            if (err) return embed.setDescription(embed.description + serversList[0] + " " + err + "\n");
            if (response.statusCode === 200) {
                embed.setDescription(embed.description + serversList[0] + " : :green_circle:\n");
            } else if (response.statusCode === 404) {
                embed.setDescription(embed.description + serversList[0] + " : :red_circle: " + response.statusCode + "\n");
            } else {
                embed.setDescription(embed.description + serversList[0] + " : :yellow_circle: " + response.statusCode + "\n");
            }
        })
        request(serversList[1], { timeout: 2000 }, (err, response) => {
            if (err) return embed.setDescription(embed.description + serversList[1] + " " + err + "\n");
            if (response.statusCode === 200) {
                embed.setDescription(embed.description + serversList[1] + " : :green_circle:\n");
            } else if (response.statusCode === 404) {
                embed.setDescription(embed.description + serversList[1] + " : :red_circle: " + response.statusCode + "\n");
            } else {
                embed.setDescription(embed.description + serversList[2] + " : :yellow_circle: " + response.statusCode + "\n" );
            }
        })
        request(serversList[2], { timeout: 2000 }, (err, response) => {
            if (err) return embed.setDescription(embed.description + serversList[2] + " " + err + "\n");
            if (response.statusCode === 200) {
                embed.setDescription(embed.description + serversList[2] + " : :green_circle:\n");
            } else if (response.statusCode === 404) {
                embed.setDescription(embed.description + serversList[2] + " : :red_circle: " + response.statusCode + "\n");
            } else {
                embed.setDescription(embed.description + serversList[2] + " : :yellow_circle: " + response.statusCode + "\n");
            }
        })
        request(serversList[3], { timeout: 2000 }, (err, response) => {
            if (err) return embed.setDescription(embed.description + serversList[3] + " " + err + "\n");
            if (response.statusCode === 200) {
                embed.setDescription(embed.description + serversList[3] + " : :green_circle:\n");
            } else if (response.statusCode === 404) {
                embed.setDescription(embed.description + serversList[3] + " : :red_circle: " + response.statusCode + "\n");
            } else {
                embed.setDescription(embed.description + serversList[3] + " : :yellow_circle: " + response.statusCode + "\n");
            }
        })
        request(serversList[4], { timeout: 2000 }, (err, response) => {
            if (err) return embed.setDescription(embed.description + serversList[4] + " " + err + "\n");
            if (response.statusCode === 200) {
                embed.setDescription(embed.description + serversList[4] + " : :green_circle:\n");
            } else if (response.statusCode === 404) {
                embed.setDescription(embed.description + serversList[4] + " : :red_circle: " + response.statusCode + "\n");
            } else {
                embed.setDescription(embed.description + serversList[4] + " : :yellow_circle: " + response.statusCode + "\n");
            }
        })
        request(serversList[5], { timeout: 2000 }, (err, response) => {
            if (err) return embed.setDescription(embed.description + serversList[5] + " " + err + "\n");
            if (response.statusCode === 200) {
                embed.setDescription(embed.description + serversList[5] + " : :green_circle:\n");
            } else if (response.statusCode === 404) {
                embed.setDescription(embed.description + serversList[5] + " : :red_circle: " + response.statusCode + "\n");
            } else {
                embed.setDescription(embed.description + serversList[5] + " : :yellow_circle: " + response.statusCode + "\n");
            }
        })
        request(serversList[6], { timeout: 2000 }, (err, response) => {
            if (err) return embed.setDescription(embed.description + serversList[6] + " " + err + "\n");
            if (response.statusCode === 200) {
                embed.setDescription(embed.description + serversList[6] + " : :green_circle:\n");
            } else if (response.statusCode === 404) {
                embed.setDescription(embed.description + serversList[6] + " : :red_circle: " + response.statusCode + "\n");
            } else {
                embed.setDescription(embed.description + serversList[6] + " : :yellow_circle: " + response.statusCode + "\n");
            }
        })
        request(serversList[7], { timeout: 2000 }, (err, response) => {
            if (err) return embed.setDescription(embed.description + serversList[7] + " " + err + "\n");
            if (response.statusCode === 200) {
                embed.setDescription(embed.description + serversList[7] + " : :green_circle:\n");
            } else if (response.statusCode === 404) {
                embed.setDescription(embed.description + serversList[7] + " : :red_circle: " + response.statusCode + "\n");
            } else {
                embed.setDescription(embed.description + serversList[7] + " : :yellow_circle: " + response.statusCode + "\n");
            }
        })
        const msg = await message.channel.send({ content: "Zbieranie danych" });

        setTimeout(() => {
            msg.delete();
            embed.setDescription(embed.description + "\n:green_circle: = Brak problemów, :yellow_circle: = Trochę problemów, :red_circle: = Niedostępne");
            message.channel.send({ embeds: [embed] });
        }, time);
    }
}