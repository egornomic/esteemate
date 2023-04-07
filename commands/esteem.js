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
