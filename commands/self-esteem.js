const { SlashCommandBuilder } = require('@discordjs/builders');
const { getEsteem } = require('../utils/firebase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('self-esteem')
    .setDescription('Check your Esteem amount.'),
  async execute(interaction) {
    const userId = interaction.user.id;
    const { guild } = interaction;
    const reputation = await getEsteem(guild.id, userId);

    await interaction.reply({ content: `You have ${reputation.toFixed(2)} Esteem.`, ephemeral: true });
  },
};
