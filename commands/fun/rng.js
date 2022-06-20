const fs = require("fs");
module.exports = {
    name: "rng",
    aliases: ["random"],
    category : "fun",
    description: "Random number from range",
    usage: "<first range> [second range]",
    permission: 5,
    run: async (client, message, args) => {
        if (args.length<1) return message.reply("Dodaj więcej argumentów");
        if (args[0]==="tak" || args[0]==="nie" || args[0]==="taklubnie" || args[0]==="tak/nie") {
            const array = ["tak", "nie"];
            const random = Math.floor(Math.random() * array.length);
            return message.channel.send(array[random]);
        }
        if (args[0]>Number.MAX_SAFE_INTEGER) return message.reply(`Zbyt wysoka liczba(Maksymalna to: ${Number.MAX_SAFE_INTEGER}).`);
        if (args[0]<Number.MIN_SAFE_INTEGER) return message.channel.send({content: `Zbyt niska liczba(Minimalna to: ${Number.MIN_SAFE_INTEGER}).`});
        if (isNaN(args[0])) return message.reply("To nie jest liczba");
        if (args.length===1) return message.reply(`Wylosowano: ${Math.floor(Math.random() * args[0])}`)
        args[0] = Math.ceil(parseInt(args[0]));
        args[1] = Math.floor(parseInt(args[1]));
        if (parseInt(args[0])>parseInt(args[1])) return message.reply(`Wylosowano: ${Math.floor(Math.random() * (args[0]-args[1])+ args[1])}`).then(message.channel.send({content: "Napisałeś liczby w odwrotnej kolejności, więc je zamieniłem :)"}));
        return message.reply(`Wylosowano: ${Math.floor(Math.random() * (args[1]-args[0])+ args[0])}`);
    }
}