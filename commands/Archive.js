const Discord = require('discord.js');
const moment = require('moment');
const utils = require('../utils/utils');

module.exports.run = async (PREFIX, message, args, bot) => {
    if(!args[1]) return message.channel.send("Please provide a channel ID to post to");
    if(!bot.channels.get(args[1])) return message.channel.send("Invalid Channel ID");

    let channelMessages = [];
    let pinnedMessages = await message.channel.fetchPinnedMessages();
    let last_message_id = message.id;
    let runningMessage = null;
    let postingChannel = bot.channels.get(args[1]);
    pinnedMessages = pinnedMessages.array();

    getMessages();

    message.channel.send("Running...")
    .then(msg => runningMessage = msg);

    async function getMessages() {
        
        let  temp = await message.channel.fetchMessages({ limit: 100, before: last_message_id });
        temp = temp.array();
        last_message_id = temp[temp.length - 1].id;
        channelMessages.push(temp);
        if(temp.length === 100) return getMessages();
        else {
            channelMessages = [].concat.apply([], channelMessages).filter(el => !el.author.bot).sort((a, b) => a.createdAt - b.createdAt);
            runningMessage.delete();
            confirmationEmbed();
        }
    };

    async function confirmationEmbed() {
        let firstMessage = channelMessages[0];
        let embed = new Discord.RichEmbed();

        embed
        .setColor(0x00ff00)
        .setTitle("Messages Collected and Ready For Archiving")
        .addField("Amount", channelMessages.length.toLocaleString(), true)
        .addField("First Message Sent", moment(firstMessage.createdAt).format("MMMM Do, YYYY"), true)
        .addField("First Message By", `${firstMessage.author.username} #${firstMessage.author.discriminator}`)

        message.channel.send(embed)
        .then(() => checkForPosting())
        .catch(err => console.error(err));
    };

    async function checkForPosting() {
        message.channel.send("Do you want to continue to posting? (y/n)")
        .then(msg => {
            const m_collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 60000 });
            m_collector.on('collect', async (m, user) => {
                switch(m.content.toLowerCase()) {
                    case "y":
                        archive();
                        m_collector.stop();
                        break;
                    case "n":
                        m_collector.stop();
                        break;
                    default:
                        break;
                }
            });
            m_collector.on('end', () => {
                msg.delete();
            })
        });
    };

    

    let counter = -1;
    let originalChannel = message.channel;
    channelMessages = channelMessages.reverse();

    async function archive() {
        counter++;
        if(counter >= channelMessages.length) return finished();
        let currentMessage = channelMessages[counter];
        let embed = new Discord.RichEmbed();
        let isPinnedMessage = false;

        /* Dev Edge Cases */
        if(currentMessage.content.length >= 1024) {
            bot.channels.get("690596792923848766").send(currentMessage.content);
            return archive();
        }
        /* End */

        if(currentMessage.type === "PINS_ADD") return archive();
        if(currentMessage.type === "GUILD_MEMBER_JOIN") return archive();
        else if(currentMessage.content !== "" && !/^[A-Za-z0-9]/.test(currentMessage.content)) return archive();
        else if(currentMessage.content.length === 1) return archive();

        embed
        .setColor(0x0099ff)
        .setAuthor(
            `${currentMessage.author.username} #${currentMessage.author.discriminator}`, 
            currentMessage.author.avatarURL ? currentMessage.author.avatarURL : "https://i.imgur.com/CBCTbyK.png"
        )
        .setFooter(`Message Originally Sent: ${moment(currentMessage.createdAt).format("M/DD/YY LT")}`, originalChannel.guild.iconURL)

        let userTag = null;
        let roleTag = null;

        if(/<@&?(\d+)>/.exec(currentMessage.content)) {
            roleTag = /<@&?(\d+)>/.exec(currentMessage.content)[1];
            currentMessage.content = await utils.replaceRoleTag(bot, currentMessage.content, message.guild.id, roleTag);
        }

        if(/<@!?(\d+)>/.exec(currentMessage.content)) {
            userTag = /<@!?(\d+)>/.exec(currentMessage.content)[1];
            currentMessage.content = await utils.replaceUserTag(bot, currentMessage.content, userTag);
        }

        if(pinnedMessages[0]) {
            if(pinnedMessages.map(el => el.id).includes(currentMessage.id))
                isPinnedMessage = true;
        }   

        if(await utils.checkString(currentMessage.content)) return parseLinks(embed, currentMessage);
        else {
            if(currentMessage.content !== "")
                embed.setDescription(currentMessage.content)
            
            if(currentMessage.attachments.size > 0) {
                let attachment = currentMessage.attachments.array()[0];
                if(attachment.url.split(".").includes("png") || attachment.url.split(".").includes("jpg") || attachment.url.split(".").includes("jpeg"))
                    embed
                    .setAuthor(
                        `${currentMessage.author.username} #${currentMessage.author.discriminator} posted an image`, 
                        currentMessage.author.avatarURL ? currentMessage.author.avatarURL : "https://i.imgur.com/CBCTbyK.png"
                    )
                    .setImage(currentMessage.attachments.array()[0].url);
                else return parseAttachments(embed, currentMessage, isPinnedMessage);
            }
        }

        postingChannel.send(embed)
        .then(msg => {
            if(isPinnedMessage) msg.pin();
            archive()
        });
    };

    async function parseLinks(embed, currentMessage, isPinnedMessage) {
        let flavorText = null;
        let filteredStr = await utils.filter(currentMessage.content);
        flavorText = filteredStr[1];
        if(filteredStr[0]) embed.setDescription(filteredStr[0])
        if(currentMessage.attachments.size > 0) 
            embed.setImage(currentMessage.attachments.array()[0].url);

        embed
        .setAuthor(
            `${currentMessage.author.username} #${currentMessage.author.discriminator} posted a link`, 
            currentMessage.author.avatarURL ? currentMessage.author.avatarURL : "https://i.imgur.com/CBCTbyK.png"
        )

        if(flavorText) {
            postingChannel.send(embed)
            .then(() => {
                postingChannel.send(flavorText)
                .then(msg => {
                    if(isPinnedMessage) msg.pin()
                    archive();
                })
            });
        }
        else return postingChannel.send(embed);
    }

    async function parseAttachments(embed, currentMessage, isPinnedMessage) {
        let attachments = currentMessage.attachments.array()[0];
        let fileSize = attachments.fileSize / 1024;
        let authorText = `${currentMessage.author.username} #${currentMessage.author.discriminator} posted an attachment`;
        let authorURL = currentMessage.author.avatarURL || "https://i.imgur.com/CBCTbyK.png";
        embed
        .setAuthor(`${authorText} ${fileSize >= 8 ? "larger than 8MB" : ""}`, authorURL)

        if(fileSize < 8) embed.attachFile(currentMessage.attachments.array()[0].url);
        
        postingChannel.send(embed)
        .then(msg => {
            if(isPinnedMessage) msg.pin()
            archive();
        });
    }

    async function finished() {
        message.channel.send("Finished");
    };
};

module.exports.config = {
    name: "archive",
    d_name: "Archive",
    aliases: []
};