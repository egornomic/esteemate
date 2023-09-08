const config = require('../config.json');
const { updateEsteem } = require('../utils/firebase');
const { logActivity } = require('../utils/logger');

module.exports = async (client, message) => {
  if (message.author.bot) return;

  const previousMessage = await message.channel.messages
    .fetch({ limit: 1, before: message.id })
    .then(messages => messages.last());

  if (previousMessage &&
      (previousMessage.author.id === message.author.id || previousMessage.author.bot)) {
    return;
  }

  let repToAdd;

  switch (message.type) {
    case 19:
      repToAdd = config.weights.reply * message.content.length;
      break;
    case 8:
      repToAdd = config.weights.guildBoost;
      break;
    case 21:
      repToAdd = config.weights.threadStarterMessage;
      break;
    case 29:
      repToAdd = config.weights.stageSpeaker;
      break;
    default:
      repToAdd = config.weights.message * message.content.length;
  }

  updateEsteem(message.guild.id, message.author.id, repToAdd);

  logActivity(client, `**${message.id}** has received **${repToAdd}** esteem for sending the message https://discord.com/channels/${config.guildId}/${message.channel.id}/${message.id}.`);
};