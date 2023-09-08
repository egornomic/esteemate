const config = require('../config.json');
const { updateEsteem } = require('../utils/firebase');
const { logActivity } = require('../utils/logger');
module.exports = async (client, reaction, user) => {
  if (user.bot) return;
  if (reaction.message.author.id === user.id) return;
  if (reaction.message.author.bot) return;
  const reactions = reaction.message.reactions.cache;
  const reactionCount = reactions.reduce((count, reaction) => count + reaction.count, 0);

  await updateEsteem(reaction.message.guild.id, user.id, config.weights.reactionGive * reactionCount);
  logActivity(client, `**${user.id}** has received **${config.weights.reactionGive}** esteem for giving a reaction to **${reaction.message.author.id}**.`);
  await updateEsteem(reaction.message.guild.id, reaction.message.author.id, config.weights.reactionReceive);
  logActivity(client, `**${reaction.message.author.id}** has received **${config.weights.reactionReceive}** esteem for receiving a reaction from **${user.id}**.`);
};
