const services = {};

services.checkString = async (str) => {
    const re = new RegExp(/(?:https?|ftp):\/\/[\n\S]+/g);
    return re.test(str);
};

services.filter = async (str) => {
    let reg = /(?:https?|ftp):\/\/[\n\S]+/g;
    let matches = str.match(reg);
    str = str.replace(reg, "");

    if(str === "") str = null;
    return [str, matches ? matches[0] : null];
};

services.replaceUserTag = async (bot, str, userId) => {
    let reg = /<@!?(\d+)>/;
    let user = bot.users.get(userId);

    str = str.replace(reg, user ? `${user.username} #${user.discriminator}` : "***[Deleted User]***");
    return str;
};

services.replaceRoleTag = async (bot, str, guildId, roleId) => {
    let reg = /<@&?(\d+)>/;
    let role = bot.guilds.get(guildId).roles.array().filter(el => el.id === roleId)[0];

    str = str.replace(reg, role ? `@${role.name}` : "***[Deleted Role]***");
    return str;
};

module.exports = services;