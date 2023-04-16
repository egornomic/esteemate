const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const config = require('./config.json');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { decayEsteem, getAllUsers } = require('./utils/firebase');
const { logActivity } = require('./utils/logger');
require ('dotenv').config();

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

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

async function updateRoles() {
  const guild = client.guilds.cache.get(config.guildId);
  const usersSnapshot = await getAllUsers(config.guildId)
  usersSnapshot.forEach(async userDoc => {
    try {
      const member = await guild.members.fetch(userDoc.id);
      const reputation = userDoc.data().reputation;
      for (const roleName in config.roles) {
        const role = config.roles[roleName];
        const roleObj = await guild.roles.fetch(role.id);
        if (reputation >= role.requirement) {
          if (!member.roles.cache.has(role.id)) {
            await member.roles.add(roleObj);
            logActivity(client, `**${userDoc.id}** has reached **${roleObj.name}**!`);
          }
        } else {
          if (member.roles.cache.has(role.id)) {
            await member.roles.remove(roleObj);
            logActivity(client, `**${userDoc.id}** has lost **${roleObj.name}**!`);
          }
        }
      }
    } catch (error) {
      if (error.code === 10013 || 10007) {
        const lastActivityTimestamp = userDoc.data().lastActivityTimestamp;
        if (!lastActivityTimestamp || Date.now() - lastActivityTimestamp > 30 * 24 * 60 * 60 * 1000) {
          await userDoc.ref.delete();
          logActivity(client, `**${userDoc.id}** has been removed from the database.`);
        }
        console.log(`Member not found in the guild: ${userDoc.id}`);
      } else {
        console.error('An error occurred:', error);
      }
    }
  });
}

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);

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

  await updateRoles();

});

setInterval(async () => {
  const totalDecay = await decayEsteem(config.guildId);
  logActivity(client, `Decayed ${totalDecay} Esteem from all users.`);
  await updateRoles();
}, 24 * 60 * 60 * 1000);

client.login(DISCORD_BOT_TOKEN);
