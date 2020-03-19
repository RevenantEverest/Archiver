const { Permissions } = require('discord.js');
const PREFIX = "$"

module.exports = (bot, message) => {
    if(message.author.bot) return;
    if(message.channel.type === "dm") return;

    let permissions = new Permissions(message.channel.permissionsFor(bot.user).bitfield);
    if(!permissions.has("SEND_MESSAGES") || !permissions.has("EMBED_LINKS")) return;
    
    if(!PREFIX) return;
    if(!message.content.startsWith(PREFIX)) return;
    
    let args = message.content.substring(PREFIX.length).split(" ");
    let commandfile = bot.commands.get(args[0].toLowerCase()) || bot.commands.get(bot.aliases.get(args[0].toLowerCase()));

    if(!commandfile) return;
    if(commandfile.config.category === "Admin" && !message.member.hasPermission('ADMINISTRATOR'))
        return message.channel.send(`You don't have permission to use this command`);
    else commandfile.run(PREFIX, message, args, bot);
};