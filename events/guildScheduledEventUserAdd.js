const config = require('../config.json');
const { updateEsteem } = require('../utils/firebase');
const { logActivity } = require('../utils/logger');

module.exports = async (client, guildScheduledEvent, user) => {
  if (user.bot) return;

  await updateEsteem(guildScheduledEvent.guild.id, user.id, config.repConstants.scheduledEvent);
  logActivity(client, `**${user.id}** has received **${config.repConstants.scheduledEvent}** Esteem for joining a guild scheduled event.`);
};
