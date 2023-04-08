const config = require('../config.json');
const { updateEsteem } = require('../utils/firebase');
const { logActivity } = require('../utils/logger');

module.exports = async (client, message) => {
  if (message.author.bot) return;
  const repToRemove = config.repConstants.default * message.content.length;
  await updateEsteem(message.guild.id, message.author.id, -repToRemove);
  logActivity(client, `**${message.author}** has lost **${repToRemove}** esteem for deleting a message in **${message.channel}**.`);
};