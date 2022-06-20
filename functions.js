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
    }
}