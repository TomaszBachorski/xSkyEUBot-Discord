const Discord = require('discord.js');
const fs = require("fs");
module.exports = {
    name: "info",
    aliases: [],
    category : "info",
    description: "Informations about fuck know what",
    usage: "",
    permission: 5,
    run: async (client, message, args) => {
        const settings = require("../../settings.json");
        let channelDescription = "";
        let channelName = "";
        let channelType = "";
        if (message.channel.type==="GUILD_TEXT"&&!message.member.voice.channel) {
            channelName = message.channel.name
            channelType = "Kanał tekstowy";
            if (!message.channel.topic) channelDescription = "Kanał nie ma opisu"
            else channelDescription = message.channel.topic;
        } else {
            let channel = message.member.voice.channel;
            console.log(channel) //something is broken
            if (!channel) {
                channelName = message.channel.name
                channelType = "Hmm odd thing happend"
                channelDescription = "Kanał nie ma opisu";
            } else {
                channelName = channel.name;
                channelType = "Kanał głosowy";
                channelDescription = "Kanał nie ma opisu";

            }
        }
        let rolemap = message.guild.roles.cache
            .sort((a, b) => b.position - a.position)
            .map(r => r)
            .join(", ");
        let emojis = message.guild.emojis.cache
            .sort((a, b) => b.position - a.position)
            .map(r => r)
            .join(", ");

        const embed_channel = new Discord.MessageEmbed()
            .setTitle("Informacje")
            .setColor("ORANGE")
            .addField(
                "Infromacje o kanale",  
                "\nNazwa kanału: " + channelName +
                "\nRodzaj kanału: "+ channelType +
                "\nOpis kanału: " + channelDescription)
            .setAuthor({name: message.guild.name, iconURL: message.guild.iconURL()});

            console.log(message.guild)
        const embed_discord = new Discord.MessageEmbed()
            .setColor("ORANGE")
            .addField(
                "Informacje o serwerze", 
                "Nazwa serwera: " + message.guild.name + 
                "\nLiczba użytkowników: " + message.guild.memberCount +
                "\nWłaściciel: <@" + message.guild.ownerId + ">" +
                "\nID serwera: " + message.guild.id +
                "\nPoziom Premium: " + message.guild.premiumTier +
                "\nUlepszenia serwera: " + message.guild.premiumSubscriptionCount +
                "\nLink do zapraszania: " + settings.inviteLink
            );
        const embed_roles = new Discord.MessageEmbed()
            .setColor("ORANGE")
            .addField(
                "Rangi na serwerze: ",
                "\nRangi: " +message.guild.roles.cache.size + 
                "\nLista rang: " + rolemap 
            )
        const embed_emojis = new Discord.MessageEmbed()
            .setColor("ORANGE")
            .addField(
                "Emotki na serwerze",
                "\nEmotki: " + message.guild.emojis.cache.size +
                "\nLista emotek: "+ emojis
            )
            .setTimestamp()
            .setFooter({text: message.author.username});
        message.channel.send({embeds: [embed_channel]}).then(
        message.channel.send({embeds: [embed_discord]})).then(
        message.channel.send({embeds: [embed_roles]})).then(
        message.channel.send({embeds: [embed_emojis]}));
    }
}