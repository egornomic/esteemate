const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const config = require('./config.json');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

// Firebase Setup
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

const { updateEsteem } = require('./utils/firebase');

client.once('ready', async () => {
  console.log('Bot is ready!');

  const rest = new REST({ version: '9' }).setToken(config.token);

  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(client.user.id, config.guildId),
      { body: client.commands.map(({ data }) => data.toJSON()) },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction, config);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const previousMessage = await message.channel.messages.fetch({ limit: 1, before: message.id }).then(messages => messages.last());
  if (previousMessage.author.id === message.author.id) return;

  let repToAdd;

  switch (message.type) {
    case 19:
      repToAdd = config.repConstants.reply * message.content.length;
      break;
    case 8:
      repToAdd = config.repConstants.guildBoost;
      break;
    case 21:
      repToAdd = config.repConstants.threadStarterMessage;
      break;
    case 29:
      repToAdd = config.repConstants.stageSpeaker;
      break;
    default:
      repToAdd = config.repConstants.default * message.content.length;
  }

  await updateEsteem(message.guild.id, message.author.id, repToAdd);
});

// client.on('messageCreate', async (message) => {
//   if (message.author.bot) return;

//   const repToAdd = message.type === 19 ? config.repConstants.message + config.repConstants.reply : config.repConstants.message;
//   await updateEsteem(message.guild.id, message.author.id, repToAdd);
// });

client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return;
  if (reaction.message.author.id === user.id) return;

  await updateEsteem(reaction.message.guild.id, reaction.message.author.id, config.repConstants.reactionReceive);
  await updateEsteem(reaction.message.guild.id, user.id, config.repConstants.reactionGive);
});

client.on('messageReactionRemove', async (reaction, user) => {
  if (user.bot) return;
  if (reaction.message.author.id === user.id) return;

  await updateEsteem(reaction.message.guild.id, reaction.message.author.id, -config.repConstants.reactionReceive);
  await updateEsteem(reaction.message.guild.id, user.id, -config.repConstants.reactionGive);
});

// const voiceActivity = new Map();

// client.on('voiceStateUpdate', async (oldState, newState) => {
//   const userId = newState.id;
//   const guildId = newState.guild.id;

//   if (!oldState.channelId && newState.channelId) {
//     // User joined a voice channel
//     const timeout = setTimeout(async () => {
//       await updateEsteem(guildId, userId, config.repConstants.voice);
//       voiceActivity.delete(`${guildId}-${userId}`);
//     }, config.voiceInterval);

//     voiceActivity.set(`${guildId}-${userId}`, timeout);
//   } else if (oldState.channelId && !newState.channelId) {
//     // User left a voice channel
//     clearTimeout(voiceActivity.get(`${guildId}-${userId}`));
//     voiceActivity.delete(`${guildId}-${userId}`);
//   }
// });

client.login(config.token);
