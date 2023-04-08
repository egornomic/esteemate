const config = require('../config.json');
const { updateEsteem } = require('../utils/firebase');
const { logActivity } = require('../utils/logger');
module.exports = async (client, reaction, user) => {
  if (user.bot) return;
  if (reaction.message.author.id === user.id) return;
  if (reaction.message.author.bot) return;

  await updateEsteem(reaction.message.guild.id, user.id, config.repConstants.reactionGive);
  logActivity(client, `**${user}** has received **${config.repConstants.reactionGive}** esteem for giving a reaction to **${reaction.message.author}**.`);
  await updateEsteem(reaction.message.guild.id, reaction.message.author.id, config.repConstants.reactionReceive);
  logActivity(client, `**${reaction.message.author}** has received **${config.repConstants.reactionReceive}** esteem for receiving a reaction from **${user}**.`);
};
