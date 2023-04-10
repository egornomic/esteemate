const config = require('../config.json');
const { updateEsteem } = require('../utils/firebase');
const { logActivity } = require('../utils/logger');

const userVoiceTime = new Map();

module.exports = async (client, oldState, newState) => {
  const userId = newState.id;
  const guildId = newState.guild.id;

  if (!oldState.channelId && newState.channelId) {
    // User joined a voice channel
    userVoiceTime.set(userId, Date.now());
  } else if (oldState.channelId && !newState.channelId) {
    // User left a voice channel
    const startTime = userVoiceTime.get(userId) || Date.now();
    const timeSpentInVoice = Date.now() - startTime;
    const repToAdd = Math.floor(timeSpentInVoice / 600000) * config.repConstants.voice;
    userVoiceTime.delete(userId);
    if (repToAdd <= 0) return;
    await updateEsteem(guildId, userId, repToAdd);
    logActivity(client, `**${newState.member.id}** has received **${repToAdd}** esteem for being in a voice channel for **${Math.floor(timeSpentInVoice / 60000)}** minutes.`);
  }
};