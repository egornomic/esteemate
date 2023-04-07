const { SlashCommandBuilder } = require('@discordjs/builders');
const { getRep } = require('../utils/firebase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('check-rep')
    .setDescription('Check the reputation of another user.')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user to check reputation for.')
        .setRequired(true)
    ),
  async execute(interaction) {
    const targetUser = interaction.options.getUser('user');
    const { guild } = interaction;
    const reputation = await getRep(guild.id, targetUser.id);

    await interaction.reply({ content: `<@${targetUser.id}> has ${reputation.toFixed(2)} reputation points.`, ephemeral: true });
  },
};