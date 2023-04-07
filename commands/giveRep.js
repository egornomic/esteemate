const { SlashCommandBuilder } = require('@discordjs/builders');
const { updateRep, burnRep } = require('../utils/firebase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('give-rep')
    .setDescription('Give reputation to another user.')
    .addNumberOption(option =>
      option
        .setName('amount')
        .setDescription('The amount of reputation to send.')
        .setRequired(true)
    )
    .addUserOption(option =>
      option
        .setName('to')
        .setDescription('The user to send reputation to.')
        .setRequired(true)
    ),
  async execute(interaction) {
    const senderId = interaction.user.id;
    const targetId = interaction.options.getUser('to').id;
    const amount = interaction.options.getNumber('amount');
    const { guild } = interaction;

    const transferAmount = amount * 0.9;
    const burnAmount = amount * 0.1;

    await updateRep(guild.id, senderId, -amount);
    await updateRep(guild.id, targetId, transferAmount);
    await burnRep(guild.id, burnAmount);

    await interaction.reply({
      content: `Transferred ${transferAmount.toFixed(2)} reputation to <@${targetId}>. ${burnAmount.toFixed(2)} reputation were burned.`,
      ephemeral: true
    });
  },
};
