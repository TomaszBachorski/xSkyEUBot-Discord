const Discord = require('discord.js');
const { formatDate} = require("../../functions.js");
const fs = require("fs");
module.exports = {
    name: "user",
    category : "info",
    description: "Informations about user",
    usage: "[mention/id]",
    permission: 5,
    run: async (client, message, args) => {
        if (args[0] && !message.mentions.members.first()) return message.channel.send({content: "Nie oznaczono osoby"});
        let member = message.mentions.members.first() || message.member;
        const filteredRoles = member.roles.cache.filter(role => role.id != message.guild.id);
        const listedRoles = filteredRoles.sort((a, b) => b.position - a.position).map(role => role.toString());

        const embed = new Discord.MessageEmbed()
            .setColor(message.member.displayHexColor)
            .setTitle(`Informacje o: ${member.user.username}`)
            .setDescription(`Role: ${(listedRoles.length===0 ?  " brak":listedRoles.join(", "))}\nDołączono: ${new Date(member.guild.joinedAt).toISOString().slice(0,10)}\nStworzono: ${new Date(member.user.createdAt).toISOString().slice(0,10)}\nNazwa użytkownika: ${member.user.username}\nTag użytkownika: ${member.user.discriminator}\nID użytkownika: ${member.user.id}`);
        message.channel.send({embeds: [embed]});
    }
}