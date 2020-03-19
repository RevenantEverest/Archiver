module.exports.run = async (PREFIX, message, args, bot) => {
    message.channel.send("Pong!")
};

module.exports.config = {
    name: "ping",
    d_name: "Ping",
    aliases: []
};