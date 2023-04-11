const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
      data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('List all commands or info about a specific command.'),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Esteemate - earn your reputation!')
      .setDescription('Esteemate is a Discord bot that allows to earn Esteem and give it to other users. Esteem is a measure of how much a user is active in the community. You earn Esteem for every action on the server!')
      .addFields(
        { name: '/help', value: 'List all commands or info about a specific command.' },
        { name: '/top-esteem', value: 'Check the Esteem leaderboard.' },
        { name: '/esteem', value: 'Send Esteem from your balance to another user. 10% of Esteem is burned on transfer.' },
        { name: '/self-esteem', value: 'Check your Esteem.' },
        { name: '/check-esteem', value: 'Check the Esteem of another user.' },
      )
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};