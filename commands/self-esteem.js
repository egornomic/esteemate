const { SlashCommandBuilder } = require('@discordjs/builders');
const { getEsteem, getUserRank } = require('../utils/firebase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('self-esteem')
    .setDescription('Check your Esteem amount.'),
  async execute(interaction) {
    const userId = interaction.user.id;
    const { guild } = interaction;
    const reputation = await getEsteem(guild.id, userId);
    const rank = await getUserRank(guild.id, userId);

    await interaction.reply({ content: `You have ${reputation.toFixed(2)} Esteem. Your rank is **${rank}**`, ephemeral: true });
  },
};
