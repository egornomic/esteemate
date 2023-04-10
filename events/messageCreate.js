const config = require('../config.json');
const { updateEsteem } = require('../utils/firebase');
const { logActivity } = require('../utils/logger');

module.exports = async (client, message) => {
  if (message.author.bot) return;

  const previousMessage = await message.channel.messages.fetch({ limit: 1, before: message.id }).then(messages => messages.last());
  if (previousMessage && previousMessage.author.id === message.author.id) return;

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

  await updateEsteem(message.guild.id, message.author.id, repToAdd);
  logActivity(client, `**${message.id}** has received **${repToAdd}** esteem for sending a message in **${message.channel}**.`);
};