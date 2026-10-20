require('dotenv').config();

const {Client, GatewayIntentBits, Events } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

client.once(Events.ClientReady, readyClient => {
    console.log(`Bot is Online @${readyClient.user.tag}`);
})

client.on(Events.InteractionCreate, async interaction =>{
    if(!interaction.isChatInputCommand()) return;

    if(interaction.commandName === "ping"){
        await interaction.reply('Pong! Bot is Active.');
    }
});

client.login(process.env.DISCORD_TOKEN);