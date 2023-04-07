const { SlashCommandBuilder } = require('@discordjs/builders');
const { updateEsteem, burnEsteem } = require('../utils/firebase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('esteem')
    .setDescription('Send Esteem to another user.')
    .addNumberOption(option =>
      option
        .setName('amount')
        .setDescription('The amount of Esteem to send.')
        .setRequired(true)
    )
    .addUserOption(option =>
      option
        .setName('to')
        .setDescription('The user to send Esteem to.')
        .setRequired(true)
    ),
  async execute(interaction) {
    const senderId = interaction.user.id;
    const targetId = interaction.options.getUser('to').id;
    const amount = interaction.options.getNumber('amount');

    if (amount <= 0) {
      const cheaterRole = interaction.guild.roles.cache.find(role => role.name === 'Cheater');
      if (cheaterRole) {
        const member = await interaction.guild.members.fetch(interaction.user.id);
        await member.roles.add(cheaterRole);
        await interaction.reply({
          content: `Uh-oh! It looks like someone's been caught red-handed! 🚨 You've been branded with the <@&${cheaterRole.id}> role for trying to pull a sneaky one with negative Esteem. Better luck next time, slick!`,
          ephemeral: true
        });
      } else {
        await interaction.reply({
          content: `Oh, you sneaky little rascal! 😏 You tried to pull a fast one with negative reputation points, huh? Lucky for you, there's no 'Cheater' role on this server... yet! But remember, I've got my eye on you!`,
          ephemeral: true
        });
      }
      return;
    }

    const { guild } = interaction;
    const transferAmount = amount * 0.9;
    const burnAmount = amount * 0.1;

    await updateEsteem(guild.id, senderId, -amount);
    await updateEsteem(guild.id, targetId, transferAmount);
    await burnEsteem(guild.id, burnAmount);

    await interaction.reply({
      content: `Transferred ${transferAmount.toFixed(2)} Esteem to <@${targetId}>. ${burnAmount.toFixed(2)} Esteem were burned.`});
  },
};
