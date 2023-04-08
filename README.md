# Esteemate
Esteemate is a Discord bot that allows users to earn and transfer points based on their activities in a server. Users gain points by sending messages, receiving reactions, and participating in voice channels. The bot also provides commands to check, send, and view the top holders.
## Features
- Users earn points for sending messages, receiving reactions, and participating in voice channels.
- Slash commands for easy and interactive user experience.
- Persistent data storage using Firebase.
- Logs user activities in a dedicated Discord text channel.
- Customizable reputation points for different activities.
## Commands
`/esteem` sends points from user to user. Part of points is burned on transfer.

`/self-esteem` replies with user's points amount.

`/check-esteem` checks user's points.

`/top-esteem` replies with top 10 users by points.


## Setup and Installation
1. Clone this repository:
```bash
git clone https://github.com/egornomic/esteemate.git
cd esteemate
```
2. Install the required dependencies:
```
npm install
```
3. Create a config.json file in the project's root directory with the following variables:
```
{
  "token": "your-bot-token",
  "guildId": "your-guild-id",
  "logChannelId": "your-log-channel-id",
  "repConstants": {
    "default": 1,
    "reply": 1.5,
    "guildBoost": 10,
    "threadStarterMessage": 1.3,
    "stageSpeaker": 3,
    "reactionReceive": 0.1,
    "reactionGive": 0.05,
    "voice": 0.1,
    "transfer": 0.9
  }
}
```
4. Add [Firebase service account](https://firebase.google.com/support/guides/service-accounts) file to the root directory and rename to `firebase-key.json`.