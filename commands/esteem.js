const { SlashCommandBuilder } = require('@discordjs/builders');
const { updateEsteem, burnEsteem } = require('../utils/firebase');
const { logActivity } = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('esteem')
    .setDescription('Send Esteem to another user.')
    .addUserOption(option =>
      option
      .setName('to')
      .setDescription('The user to send Esteem to.')
      .setRequired(true)
      )
      .addNumberOption(option =>
        option
          .setName('amount')
          .setDescription('The amount of Esteem to send. 10% of this amount will be burned.')
          .setRequired(true)
      ).addStringOption(option =>
        option
          .setName('for')
          .setDescription('The reason for sending Esteem.')
          .setRequired(false)
      ),
  async execute(interaction) {
    const senderUser = interaction.user;
    const senderId = senderUser.id;
    const targetUser = interaction.options.getUser('to');
    const targetId = targetUser.id;
    const amount = interaction.options.getNumber('amount');
    const reason = interaction.options.getString('for') || 'no reason';

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
    logActivity(interaction.client, `${senderUser} has lost **${amount}** esteem for sending **${transferAmount}** esteem to ${targetUser}.`);
    await updateEsteem(guild.id, targetId, transferAmount);
    logActivity(interaction.client, `${targetUser} has received **${transferAmount}** esteem for receiving **${amount}** esteem from ${senderUser}.`);
    await burnEsteem(guild.id, burnAmount);
    logActivity(interaction.client, `**${burnAmount}** esteem were burned for sending **${amount}** esteem from ${senderUser} to ${targetUser}.`);

    await interaction.reply({
      content: `Transferred **${transferAmount.toFixed(2)}** Esteem to <@${targetId}> for ${reason}. **${burnAmount.toFixed(2)}** Esteem were burned.`});
  },
};
