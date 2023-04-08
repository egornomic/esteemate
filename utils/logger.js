const config = require('../config.json');

async function logActivity(client, message) {
  const guild = await client.guilds.fetch(config.guildId);

  let logChannel = guild.channels.cache.get(config.logChannelId);

  if (!logChannel) {
    console.error(`Log channel not found with ID: ${channelId}`);
    return;
  }

  logChannel.send(message);
}

module.exports = {
  logActivity,
};
