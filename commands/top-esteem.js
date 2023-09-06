const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('@discordjs/builders');
const { getTopEsteem, getBurnedEsteem, getDecayedEsteem } = require('../utils/firebase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('top-esteem')
    .setDescription('Display the top 10 users by Esteem.'),
  async execute(interaction) {
    const { guild } = interaction;
    const topUsers = await getTopEsteem(guild.id);
    const burnedRep = await getBurnedEsteem(guild.id);
    const decayedRep = await getDecayedEsteem(guild.id);

    const embed = new EmbedBuilder()
      .setTitle('Top 10 Users by Esteem')
      .setDescription(topUsers.map((user, index) => `${index + 1}. <@${user.id}> - ${user.reputation.toFixed(2)}`).join('\n'))
      .setFooter({text: `Burned: ${burnedRep.toFixed(0)}, Decayed: ${decayedRep.toFixed(0)}`})

    await interaction.reply({ embeds: [embed] });
  },
};