const Discord = require('discord.js');
const moment = require('moment');
const chalk = require('chalk');
const fs = require('fs');

async function setCommands(bot) {
    bot.commands = new Discord.Collection();
    bot.aliases = new Discord.Collection();
    bot.config = new Discord.Collection();

    fs.readdir(`./commands`, async (err, files) => {
        if(err) console.error(err);
        let jsfile = files.filter(f => f.split(".").pop() === 'js');
        if(jsfile.length <= 0) return console.error(chalk.hex('#ff9900')("[LOG]") + " Couldn't find Commands");
        jsfile.forEach((f, i) => {
            let pull = require(`../../commands/${f}`);
            bot.commands.set(pull.config.name, pull);

            pull.config.aliases.forEach(alias => {
                bot.aliases.set(alias, pull.config.name);
            });
        });
        console.log(chalk.hex('#ff9900')("[LOG]") + " Commands Set");
    });
}

module.exports = async (bot) => {

    setCommands(bot);

    if(process.env.ENVIRONMENT === "DEV")
        return console.log(chalk.hex("#00ff00")("[LOG]") + " Archiver Ready");

    let embed = new Discord.RichEmbed();
    embed.setColor(0xff9900).setTitle("Archiver Ready").setFooter(moment().format("LLLL") + " EST");

    bot.channels.get().send(embed);
};