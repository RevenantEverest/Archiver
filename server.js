require('dotenv').config();

const Discord = require('discord.js');
const bot = new Discord.Client();

bot.on("message", (message) => {
    if(message.content.toLowerCase() === "ping")
        return message.channel.send("Pong!");
});

bot.login(process.env.DISCORD_TOKEN);