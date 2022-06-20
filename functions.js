const ytdl = require("ytdl-core");
const fs = require("fs");
const mysql = require("mysql");
module.exports = {
    formatDate: function (date) {
        return new Intl.DateTimeFormat('pl-PL').format(date);
    },
    today: function () {
        let today = new Date();
        let biggerToday = (today.getDate() < 10 ? "0" : "") + today.getDate() + "." + (today.getMonth() < 9 ? "0" : "") + (today.getMonth() + 1) + "." + today.getFullYear();
        return biggerToday;
    },
    today2: function () {
        let today = new Date();
        let biggerToday = + today.getFullYear() + "-" + (today.getMonth() < 9 ? "0" : "") + (today.getMonth() + 1) + "-" + (today.getDate() < 10 ? "0" : "") + today.getDate();
        return biggerToday;
    },
    addDays: function (date, days) {
        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    },
    time: function () {
        let today = new Date();
        let time = (today.getHours() < 10 ? "0" : "") + today.getHours() + ":" + (today.getMinutes() < 10 ? "0" : "") + today.getMinutes() + ":" + (today.getSeconds() < 10 ? "0" : "") + today.getSeconds();
        return time;
    },
    isMonth: function (month) {
        month.toLowerCase();
        if (month === "all") return "all";
        if (new Date(`1 ${month}`).getMonth()!==0 || month==="january") return new Date(`1 ${month}`).getMonth();
        return false;
    },
    replaceMonth: function (month) {
        const localization = require(fs.readFileSync("./language/language.txt").toString().split("\n")[0]);
        month = this.isMonth(month)
        if (month === 1) {
            return localization.functions_january
        } else if (month === 2) {
            return localization.functions_february
        } else if (month === 3) {
            return localization.functions_march
        } else if (month === 4) {
            return localization.functions_april
        } else if (month === 5) {
            return localization.functions_may
        } else if (month === 6) {
            return localization.functions_june
        } else if (month === 7) {
            return localization.functions_july
        } else if (month === 8) {
            return localization.functions_august
        } else if (month === 9) {
            return localization.functions_september
        } else if (month === 10) {
            return localization.functions_october
        } else if (month === 11) {
            return localization.functions_november
        } else if (month === 12) {
            return localization.functions_december
        } else if (month === "all") {
            return localization.functions_all
        } else {
            return false;
        }
    },
    replaceMonth2: function (month) {
        const localization = require(fs.readFileSync("./language/language.txt").toString().split("\n")[0]);
        month = this.isMonth(month)
        if (month === 1) {
            return localization.functions_january2
        } else if (month === 2) {
            return localization.functions_february2
        } else if (month === 3) {
            return localization.functions_march2
        } else if (month === 4) {
            return localization.functions_april2
        } else if (month === 5) {
            return localization.functions_may2
        } else if (month === 6) {
            return localization.functions_june2
        } else if (month === 7) {
            return localization.functions_july2
        } else if (month === 8) {
            return localization.functions_august2
        } else if (month === 9) {
            return localization.functions_september2
        } else if (month === 10) {
            return localization.functions_october2
        } else if (month === 11) {
            return localization.functions_november2
        } else if (month === 12) {
            return localization.functions_december2
        } else if (month === "all") {
            return localization.functions_all2
        } else {
            return false;
        }
    },
    replaceMonth3: function (month) {
        const localization = require(fs.readFileSync("./language/language.txt").toString().split("\n")[0]);
        if (month === 1) {
            return localization.functions_january
        } else if (month === 2) {
            return localization.functions_february
        } else if (month === 3) {
            return localization.functions_march
        } else if (month === 4) {
            return localization.functions_april
        } else if (month === 5) {
            return localization.functions_may
        } else if (month === 6) {
            return localization.functions_june
        } else if (month === 7) {
            return localization.functions_july
        } else if (month === 8) {
            return localization.functions_august
        } else if (month === 9) {
            return localization.functions_september
        } else if (month === 10) {
            return localization.functions_october
        } else if (month === 11) {
            return localization.functions_november
        } else if (month === 12) {
            return localization.functions_december
        } else if (month === "all") {
            return localization.functions_all
        } else {
            return false;
        }
    },
    replaceMonth4: function (month) {
        const localization = require(fs.readFileSync("./language/language.txt").toString().split("\n")[0]);
        month = this.isMonth(month)
        if (month === 1) {
            return localization.functions_january3
        } else if (month === 2) {
            return localization.functions_february3
        } else if (month === 3) {
            return localization.functions_march3
        } else if (month === 4) {
            return localization.functions_april3
        } else if (month === 5) {
            return localization.functions_may3
        } else if (month === 6) {
            return localization.functions_june3
        } else if (month === 7) {
            return localization.functions_july3
        } else if (month === 8) {
            return localization.functions_august3
        } else if (month === 9) {
            return localization.functions_september3
        } else if (month === 10) {
            return localization.functions_october3
        } else if (month === 11) {
            return localization.functions_november3
        } else if (month === 12) {
            return localization.functions_december3
        } else if (month === "all") {
            return localization.functions_all3
        } else {
            return false;
        }
    },
    createMysqlTable: function (month) {
        if (month === 1) {
            return "January"
        } else if (month === 2) {
            return "February"
        } else if (month === 3) {
            return "March"
        } else if (month === 4) {
            return "April"
        } else if (month === 5) {
            return "May"
        } else if (month === 6) {
            return "June"
        } else if (month === 7) {
            return "July"
        } else if (month === 8) {
            return "August"
        } else if (month === 9) {
            return "September"
        } else if (month === 10) {
            return "October"
        } else if (month === 11) {
            return "November"
        } else if (month === 12) {
            return "December"
        } else {
            return false;
        }
    },
    sqlMonth: function (month) {
        month = month.toLowerCase().slice(0, -4);
        month = this.isMonth(month);
        if (month === 1) {
            return "january"
        } else if (month === 2) {
            return "february"
        } else if (month === 3) {
            return "march"
        } else if (month === 4) {
            return "april"
        } else if (month === 5) {
            return "may"
        } else if (month === 6) {
            return "june"
        } else if (month === 7) {
            return "july"
        } else if (month === 8) {
            return "august"
        } else if (month === 9) {
            return "september"
        } else if (month === 10) {
            return "october"
        } else if (month === 11) {
            return "november"
        } else if (month === 12) {
            return "december"
        } else {
            return false;
        }
    },
    sqlYear: function (year) {
        year = year.slice(-4);
        return year;
    },
    noPermissions: function () {
        const Discord = require('discord.js');
        const localization = require(fs.readFileSync("./language/language.txt").toString().split("\n")[0]);
        const wrongowner = new Discord.MessageEmbed()
            .setDescription(localization.wrong_user)
            .setColor('#0099ff');
        return message.channel.send(wrongowner);
    }
}