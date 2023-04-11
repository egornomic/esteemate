const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const config = require('./config.json');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require ('dotenv').config();

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

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
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  const eventName = file.split('.')[0];
  client.on(eventName, event.bind(null, client));
}

client.once('ready', async () => {
  console.log('Bot is ready!');

  const rest = new REST({ version: '9' }).setToken(DISCORD_BOT_TOKEN);

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

client.login(DISCORD_BOT_TOKEN);
