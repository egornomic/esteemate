const config = require('../config.json');
const { updateEsteem } = require('../utils/firebase');

module.exports = async (client, reaction, user) => {
  if (user.bot) return;
  if (reaction.message.author.id === user.id) return;

  await updateEsteem(reaction.message.guild.id, reaction.message.author.id, config.repConstants.reactionReceive);
  await updateEsteem(reaction.message.guild.id, user.id, config.repConstants.reactionGive);
};
