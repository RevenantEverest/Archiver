const moment = require('moment');
const utils = require('../utils/utils');

module.exports.run = async (PREFIX, message, args, bot) => {
    let userTag = null;
    let roleTag = null;

    if(/<@&?(\d+)>/.exec(message.content)) roleTag = /<@&?(\d+)>/.exec(message.content)[1];
    if(/<@!?(\d+)>/.exec(message.content)) userTag = /<@!?(\d+)>/.exec(message.content)[1];

    message.content = await utils.replaceUserTag(bot, message.content, userTag);

    // console.log(message.content);

    message.channel.send("@BOTS")
};

module.exports.config = {
    name: "test",
    d_name: "Test",
    aliases: []
};