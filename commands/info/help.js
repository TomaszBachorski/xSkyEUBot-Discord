const Discord = require('discord.js');
const { stripIndents } = require("common-tags");
const fs = require("fs");
const settings = require("../../settings.json");
module.exports = {
    name: "help",
    category : "info",
    description: "Informations about command or commands list",
    usage: "[command name]",
    permission: 5,
    run: async (client, message, args) => {
        if (args[0]) {
            return getCMD(client, message, args[0]);
        } else {
            return getAll(client, message);
        }
    }
}
function getAll(client, message) {
    const embed = new Discord.MessageEmbed()
        .setColor("RANDOM");
    const commands = (category) => {
        return client.commands
            .filter(cmd => cmd.category === category)
            .map(cmd => `- \`${cmd.name}\``)
            .join( "\n");
    }
    let info = client.categories
        .map(cat => stripIndents`**${cat[0].toUpperCase() + cat.slice(1)}** \n${commands(cat)}`)
        .reduce((string, category) => string + "\n" + category);
    return message.channel.send({embeds: [embed.setDescription(info).setFooter({text: `Argumenty w <> są wymagane, ale w [] są opcjonalne`}).setTimestamp()]});
}

function getCMD(client, message, input) {
    const embed = new Discord.MessageEmbed()
    const cmd = client.commands.get(input.toLowerCase()) || client.commands.get(client.aliases.get(input.toLowerCase()));
    let info = "Nie znaleziono żadnych informacji dla komendy: "+ input.toLowerCase();
    if (!cmd) return message.channel.send({embeds: [embed.setColor("RED").setDescription(info)]});
    if (cmd.aliases) info += "\nZamienniki: "+cmd.aliases.map(a => `\`${a}\``).join(", ");
    if (cmd.name) info = "\nNazwa komendy: "+ cmd.name;
    if (cmd.description) info += "\nOpis: " +cmd.description;
    if (cmd.usage) info += "\nArgumenty: " + cmd.usage;
    if (cmd.permission) info += "\nPermisje: " + cmd.permission;
    return message.channel.send({embeds: [embed.setColor("GREEN").setDescription(info).setFooter({text: "Argumenty w <> są wymagane, ale w [] są opcjonalne"})]});
}