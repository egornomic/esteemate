const { SlashCommandBuilder } = require('@discordjs/builders');
const { getRep } = require('../utils/firebase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('my-rep')
    .setDescription('Check your reputation.'),
  async execute(interaction) {
    const userId = interaction.user.id;
    const { guild } = interaction;
    const reputation = await getRep(guild.id, userId);

    await interaction.reply({ content: `You have ${reputation.toFixed(2)} reputation points.`, ephemeral: true });
  },
};
