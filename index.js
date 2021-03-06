const { Client, Collection, Intents } = require("discord.js");
const { config } = require("dotenv");
const Discord = require('discord.js');
const fs = require("fs");
const functions = require("./functions.js");
const mysql = require("mysql");

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MESSAGE_TYPING,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGE_TYPING
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});

client.commands = new Collection();
client.aliases = new Collection();
client.categories = fs.readdirSync("./commands/");

config({
    path: __dirname + "/.env"
});

["command"].forEach(handler => {
    require(`./handler/${handler}`)(client);
});


//giveaways roller
client.on("ready", () => {
    const settings = require("./settings.json");
    let connection = mysql.createConnection({
        host: settings.mySQLhost,
        user: settings.mySQLuser,
        password: settings.mySQLpassword,
        database: settings.mySQLdatabase
    });
    setInterval(() => {
        let currentTime = functions.today2() + " " + functions.time();
        connection.query(`SELECT * FROM giveaways WHERE hasEnded = false AND enddate < '${currentTime}'`, (err, result) => {
            if (err) throw err;
            if (result.length === 0) return;
            const guild = client.guilds.cache.get(settings.guildId);
            // let winnerrole = guild.roles.cache.find(role => role.id === settings.giveawayWinnerRole);
            // if (!winnerrole) return;
            let winnersArray = []
            let finalWinners = "";
            let winnersCount = result[0].numberOfWinners;
            client.channels.cache.get(settings.giveawayChannel).messages.fetch(result[0].messageID).then(message => {
                message.reactions.cache.get("????").users.fetch().then(user => {
                    if (message.reactions.cache.get("????").count - 1 < winnersCount) {
                        connection.query(`UPDATE giveaways SET hasEnded = true, winners = 'error' WHERE messageID = '${result[0].messageID}'`, function (err, result) {
                            if (err) throw err;
                        });
                        return client.channels.cache.get(settings.giveawayChannel).send({ content: "Zbyt ma??a ilo???? os??b zareagowa??a, wi??c nie wylosowano zwyci??zc??w" })
                    }
                    for (let i = 0; i < winnersCount;) {
                        userRandom = user.filter(u => !u.bot).random();
                        if (winnersArray.includes(userRandom.id)) {
                        } else {
                            winnersArray.push(userRandom.id)
                            i++;
                        }
                    }
                    for (let i = 0; i < winnersArray.length; i++) {
                        finalWinners = finalWinners + "<@" + winnersArray[i] + ">, ";
                    }
                    if (winnersCount == 1) client.channels.cache.get(settings.giveawayChannel).send({ content: `${finalWinners} wygrywa ${result[0].rewards}! Gratulacje!` });
                    else client.channels.cache.get(settings.giveawayChannel).send({ content: `${finalWinners} wygrywaj?? ${result[0].rewards}! Gratulacje!` });
                    connection.query(`UPDATE giveaways SET hasEnded = true, winners = '${winnersArray}' WHERE messageID = '${result[0].messageID}'`, function (err, result) {
                        if (err) throw err;
                        return;
                    });
                });
            });
        });
    }, settings.giveawayRefreshTime * 1000);
});

//unmuter
client.on("ready", () => {
    let settings = require("./settings.json");
    let connection = mysql.createConnection({
        host: settings.mySQLhost,
        user: settings.mySQLuser,
        password: settings.mySQLpassword,
        database: settings.mySQLdatabase
    });
    delete require.cache[require.resolve("./settings.json")], settings;
    setInterval(() => {
        let settings = require("./settings.json");
        const guild = client.guilds.cache.get(settings.guildId);
        let muterole = guild.roles.cache.find(role => role.id === settings.muteRole);
        if (!muterole) return client.channels.cache.get(settings.punishmentChannel).send({ content: "Rola do wyciszania nie zosta??a znaleziona" });
        let currentTime = functions.today2() + " " + functions.time();
        const embed = new Discord.MessageEmbed().setColor("ORANGE");
        connection.query(`SELECT * FROM mutes WHERE mutedUntil<'${currentTime}'`, (err, result) => {
            if (err) throw err;
            for (let i = 0; i < result.length; i++) {
                let user = guild.members.cache.get(result[i].mutedPersonID);
                embed.setTitle("Zosta??e?? pomy??lnie odciszony").setDescription(`Zosta??e?? wyciszony przez <@${result[i].muteBy}>, z powodu ${result[i].muteReason}. W tym momencie zosta??e?? odciszony i mamy nadziej??, ??e to ju?? si?? nigdy nie powt??rzy!`).setFooter({ text: "Ta wiadomo???? zosta??a wys??ana automatycznie" }).setTimestamp();
                connection.query(`DELETE FROM mutes WHERE mutedPersonID = '${result[i].mutedPersonID}'`, (err, result) => {
                    if (err) throw err;
                    if (!user) return;
                    user.roles.remove(muterole);
                    user.send({ embeds: [embed] });
                    return;
                });
            }
            return;
        });
    }, settings.muteRefreshTime * 1000);
    return;
});

//unbanner
client.on("ready", () => {
    let settings = require("./settings.json");
    let connection = mysql.createConnection({
        host: settings.mySQLhost,
        user: settings.mySQLuser,
        password: settings.mySQLpassword,
        database: settings.mySQLdatabase
    });
    delete require.cache[require.resolve("./settings.json")], settings;
    setInterval(function () {
        const guild = client.guilds.cache.get(settings.guildId);
        let currentTime = functions.today2() + " " + functions.time();
        connection.query(`SELECT * FROM bans WHERE bannedUntil<'${currentTime}'`, function (err, result) {
            if (err) throw err;
            if (result.length === 0) return;
            for (let i = 0; i < result.length; i++) {
                connection.query(`DELETE FROM bans WHERE bannedPersonID = '${result[i].bannedPersonID}'`, function (err, result2) {
                    if (err) throw err;
                    if (result[i].isBanned === 0) return;
                    guild.fetchBans().then(bans => {
                        let buser = bans.find(b => b.user.id == result[i].bannedPersonID);
                        guild.members.unban(buser.user);
                        return;
                    });
                });
            }
            return;
        });
    }, settings.banRefreshTime * 1000);
    return;
});

//checker if person is not muted, and tries to pass security
client.on("guildMemberAdd", (user) => {
    let settings = require("./settings.json");
    let connection = mysql.createConnection({
        host: settings.mySQLhost,
        user: settings.mySQLuser,
        password: settings.mySQLpassword,
        database: settings.mySQLdatabase
    });
    const guild = client.guilds.cache.get(settings.guildId);
    let muterole = guild.roles.cache.find(role => role.id === settings.muteRole);
    if (!muterole) return client.channels.cache.get(settings.punishmentChannel).send({ content: "Rola do wyciszania nie zosta??a znaleziona" });
    connection.query(`SELECT * FROM mutes WHERE mutedPersonID = '${user.id}'`, function (err, result) {
        if (err) throw (err);
        if (result.length === 0) return;
        let userJoined = guild.members.cache.get(result[0].mutedPersonID);
        userJoined.roles.add(muterole.id);
    });
});

//checker if person has not been banned and left before ban
client.on("guildMemberAdd", function (user) {
    let settings = require("./settings.json");
    let connection = mysql.createConnection({
        host: settings.mySQLhost,
        user: settings.mySQLuser,
        password: settings.mySQLpassword,
        database: settings.mySQLdatabase
    });
    connection.query(`SELECT * FROM bans WHERE bannedPersonID = '${user.id}'`, (err, result) => {
        if (err) throw err;
        if (result.length === 0) return;
        user.ban({ reason: result[0].reason });
        connection.query(`UPDATE bans SET isBanned = true WHERE bannedPersonID = ${user.id}`, (err, result) => {
            if (err) throw err;
            return;
        });

    });
})

//Collects information about user who joined a server
client.on("guildMemberAdd", function (user) {
    let settings = require("./settings.json");
    let connection = mysql.createConnection({
        host: settings.mySQLhost,
        user: settings.mySQLuser,
        password: settings.mySQLpassword,
        database: settings.mySQLdatabase
    });
    delete require.cache[require.resolve("./settings.json")], settings;
    connection.connect(function (err) {
        if (err) throw err;
        connection.query(`SELECT * FROM users WHERE id = '${user.user.id}'`, (err, result) => {
            if (err) throw err;
            if (result.length === 0) {
                connection.query(`INSERT INTO users VALUES ("${user.user.id}", 0, true)`, (err, result) => {
                    if (err) throw err;
                });
                return;
            } else {
                connection.query(`UPDATE users SET isOnServer = true WHERE id = '${user.user.id}'`, (err, result) => {
                    if (err) throw err;
                });
                return;
            }
        });
    });
});

//Updates informations about user who left server
client.on("guildMemberRemove", function (user) {
    let settings = require("./settings.json");
    let connection = mysql.createConnection({
        host: settings.mySQLhost,
        user: settings.mySQLuser,
        password: settings.mySQLpassword,
        database: settings.mySQLdatabase
    });
    delete require.cache[require.resolve("./settings.json")], settings;
    connection.connect(function (err) {
        if (err) throw err;
        connection.query(`SELECT * FROM users WHERE id = '${user.user.id}'`, (err, result) => {
            if (err) throw err;
            connection.query(`UPDATE users SET isOnServer = false WHERE id = '${user.user.id}'`, (err, result) => {
                if (err) throw err;
                return;
            });
        });
    });
});

client.on("messageCreate", (message)=> {
    let settings = require("./settings.json");
    let connection = mysql.createConnection({
        host: settings.mySQLhost,
        user: settings.mySQLuser,
        password: settings.mySQLpassword,
        database: settings.mySQLdatabase
    });
    connection.query(`SELECT * FROM users WHERE id = "${message.author.id}";`, (err ,res)=> {
        if (err) throw err;
        if(res.length !== 0) return;
        connection.query(`INSERT INTO users VALUES ("${message.author.id}", 0, true);`, (err, res)=>{
            if (err) throw err;
            return;
        });
    });
})

//Message counter
client.on("messageCreate", async message => {
    if (message.author.bot) return;
    if (!message.guild) return;
    let settings = require("./settings.json");
    let connection = mysql.createConnection({
        host: settings.mySQLhost,
        user: settings.mySQLuser,
        password: settings.mySQLpassword,
        database: settings.mySQLdatabase
    });
    delete require.cache[require.resolve("./settings.json")], settings;
    let date = new Date();
    let columnName = functions.createMysqlTable((date.getMonth() + 1)) + date.getFullYear();
    connection.query("SHOW COLUMNS FROM messages", function (err, result) {
        if (err) throw err;
        let bulion = false;
        for (let i = 0; i < result.length; i++) {
            if (result[i].Field === columnName) {
                bulion = true;
                return;
            }
        }
        if (bulion === false) {
            connection.query("ALTER TABLE messages ADD COLUMN " + columnName + " INT DEFAULT 0", (err, result) => {
                if (err) console.error(err);
                return;
            });
        }
        return;
    });
    connection.query(`SELECT * FROM messages WHERE id = '${message.author.id}'`, (err, result) => {
        if (err) throw err;
        if (result.length === 0) {
            let insertValues = [message.author.id, 1, 1]
            connection.query(`INSERT INTO messages (id, allMessages, ${columnName}) VALUES (?)`, [insertValues], (err, result) => {
                if (err) throw err;
                return;
            });
            return;
        } else {
            let messageCount = 1;
            if (isNaN((result[0][functions.createMysqlTable((date.getMonth() + 1)) + date.getFullYear()]))) {
                messageCount = 1;
            } else {
                messageCount = (result[0][functions.createMysqlTable((date.getMonth() + 1)) + date.getFullYear()]) + 1;

            }
            let allMessagesCount = (result[0].allMessages) + 1;
            connection.query(`UPDATE messages SET allMessages = ${allMessagesCount}, ${columnName} = ${messageCount} WHERE id = '${message.author.id}'`, function (err, result) {
                if (err) throw err;
                return;
            });
            return;
        }
    });
    return;
});

client.on("messageCreate", async message => {
    const settings = require("./settings.json");
    const prefix = settings.prefix;
    if (message.content.toLowerCase() === "good bot") return message.channel.send({ content: "beep boop" });
    if (message.author.bot) return;
    if (!message.guild) return message.channel.send({ content: "Przepraszam, ale jestem tylko u??yteczny na serwerach discord" });
    if (!message.content.startsWith(prefix)) return;

    let connection = mysql.createConnection({
        host: settings.mySQLhost,
        user: settings.mySQLuser,
        password: settings.mySQLpassword,
        database: settings.mySQLdatabase
    });
    let CanIuseBot = true;
    const embed = new Discord.MessageEmbed()
        .setDescription("iThomash jest moim bogiem i tylko on mo??e mnie u??ywa??, je??li chcesz zosta?? moim kolejnym w??a??cicielem napisz do niego")
        .setColor('#0099ff');
    connection.query(`SELECT * FROM users WHERE id = '${message.author.id}'`, (err, result) => {
        if (err) throw err;
        //zebranie informacji o permisji komendy
        const cmd = client.commands.get(message.content.slice(prefix.length).trim().split(/ +/g).shift().toLowerCase()) || client.commands.get(client.aliases.get(message.content.slice(prefix.length).trim().split(/ +/g).shift().toLowerCase()));
        if (!cmd) return;
        if (result[0].permissions === 0) return message.channel.send({ embeds: [embed] });
        if (!result) return message.channel.send({ content: "B????d 404" });
        if ((!cmd.permission && result[0] < cmd.permission) || result[0].permissions < cmd.permission) CanIuseBot = false;
        if (CanIuseBot === false) return message.channel.send({ embeds: [embed.setDescription("Nie masz pozwolenia na u??ywanie tej komendy")] });
        else {
            if (!message.member) message.member = message.guild.fetchMember(message);
            const args = message.content.slice(prefix.length).trim().split(/ +/g);
            const cmd = args.shift().toLowerCase();
            if (cmd.length === 0) return;
            let command = client.commands.get(cmd);
            if (!command) command = client.commands.get(client.aliases.get(cmd));
            if (command) command.run(client, message, args);
        }
    });
});

client.login(process.env.TOKEN);