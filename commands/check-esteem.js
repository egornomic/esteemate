const { SlashCommandBuilder } = require('@discordjs/builders');
const { getEsteem } = require('../utils/firebase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('check-esteem')
    .setDescription('Check the Esteem of another user.')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user to check Esteem for.')
        .setRequired(true)
    ),
  async execute(interaction) {
    const targetUser = interaction.options.getUser('user');
    const { guild } = interaction;
    const reputation = await getEsteem(guild.id, targetUser.id);

    await interaction.reply({ content: `<@${targetUser.id}> has ${reputation.toFixed(2)} reputation points.`, ephemeral: true });
  },
};