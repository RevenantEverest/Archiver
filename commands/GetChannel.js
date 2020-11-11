module.exports.run = async (PREFIX, message, args, bot) => {
    return message.channel.send(`**Channel ID:** ${message.channel.id}`);
};

module.exports.config = {
    name: "getchannel",
    d_name: "GetChannel",
    aliases: ['gc']
};