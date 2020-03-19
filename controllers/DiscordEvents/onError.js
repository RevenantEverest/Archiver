const Discord = require('discord.js');
const moment = require('moment');
const chalk = require('chalk');

module.exports = async (bot, err) => {
    if(process.env.ENVIRONMENT === "DEV")
        return console.log(chalk.hex("#ff0000")("[ERROR]") + " Client Error");

    let embed = new Discord.RichEmbed();
    embed.setColor(0xff0000).setTitle("CLIENT ERROR").setFooter(moment().format("LLLL") + " EST");

    bot.channels.get().send(embed);
};