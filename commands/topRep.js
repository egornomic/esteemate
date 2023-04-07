const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('@discordjs/builders');
const { getTopRep, getBurnedRep } = require('../utils/firebase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('top-rep')
    .setDescription('Display the top 10 users by reputation.'),
  async execute(interaction) {
    const { guild } = interaction;
    const topUsers = await getTopRep(guild.id);
    const burnedRep = await getBurnedRep(guild.id);

    const embed = new EmbedBuilder()
      .setTitle('Top 10 Users by Reputation')
      .setDescription(topUsers.map((user, index) => `${index + 1}. <@${user.id}> - ${user.reputation.toFixed(2)} points`).join('\n'))
      .setFooter({text: `Total Burned: ${burnedRep.toFixed(0)}`})

    await interaction.reply({ embeds: [embed] });
  },
};