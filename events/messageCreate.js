const config = require('../config.json');
const { updateEsteem } = require('../utils/firebase');
const { logActivity } = require('../utils/logger');

module.exports = async (client, message) => {
  if (message.author.bot) return;

  const previousMessage = await message.channel.messages
    .fetch({ limit: 1, before: message.id })
    .then(messages => messages.last());
  if (previousMessage && previousMessage.author.id === message.author.id) return;
  if (previousMessage.author.bot) return;

  let repToAdd;

  switch (message.type) {
    case 19:
      repToAdd = config.repConstants.reply * message.content.length;
      break;
    case 8:
      repToAdd = config.repConstants.guildBoost;
      break;
    case 21:
      repToAdd = config.repConstants.threadStarterMessage;
      break;
    case 29:
      repToAdd = config.repConstants.stageSpeaker;
      break;
    default:
      repToAdd = config.repConstants.default * message.content.length;
  }

  const newRep = await updateEsteem(message.guild.id, message.author.id, repToAdd);

  /** 
   * Check if the user has reached a new role threshold and add/remove the role accordingly.
   */
  for (const roleName in config.roles) {
    const role = config.roles[roleName];
    const roleObj = await message.guild.roles.fetch(role.id);
    if (newRep >= role.requirement) {
      if (!message.member.roles.cache.has(role.id)) {
        await message.member.roles.add(roleObj);
      }
    } else {
      if (message.member.roles.cache.has(role.id)) {
        await message.member.roles.remove(roleObj);
      }
    }
  }

  logActivity(client, `**${message.id}** has received **${repToAdd}** esteem for sending a message in **${message.channel}**.`);
};