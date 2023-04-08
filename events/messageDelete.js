const config = require('../config.json');
const { updateEsteem } = require('../utils/firebase');

module.exports = async (client, message) => {
  repToRemove = config.repConstants.default * message.content.length;
  await updateEsteem(message.guild.id, message.author.id, -repToRemove);
};