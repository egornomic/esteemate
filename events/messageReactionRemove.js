const config = require('../config.json');
const { updateEsteem } = require('../utils/firebase');
const { logActivity } = require('../utils/logger');

module.exports = async (client, reaction, user) => {
  if (user.bot) return;
  if (reaction.message.author.id === user.id) return;
  if (reaction.message.author.bot) return;

  await updateEsteem(reaction.message.guild.id, user.id, -config.weights.reactionGive);
  logActivity(client, `**${user.id}** has lost **${config.weights.reactionGive}** esteem for removing a reaction from **${reaction.message.author.id}**.`);
  await updateEsteem(reaction.message.guild.id, reaction.message.author.id, -config.weights.reactionReceive);
  logActivity(client, `**${reaction.message.author.id}** has lost **${config.weights.reactionReceive}** esteem for losing a reaction from **${user.id}**.`);
};