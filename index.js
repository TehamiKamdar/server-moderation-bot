
require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const {
    Client,
    GatewayIntentBits,
    Events
} = require('discord.js');

if (!process.env.DISCORD_TOKEN) {
    throw new Error('DISCORD_TOKEN is missing from .env');
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

client.commands = new Map();

function getCommandFiles(directory) {
    if (!fs.existsSync(directory)) return [];

    return fs.readdirSync(directory, { withFileTypes: true })
        .flatMap(entry => {
            const fullPath = path.join(directory, entry.name);

            if (entry.isDirectory()) {
                return getCommandFiles(fullPath);
            }

            return entry.isFile() && entry.name.endsWith('.js')
                ? [fullPath]
                : [];
        });
}

for (const file of getCommandFiles(path.join(__dirname, 'commands'))) {
    const command = require(file);

    if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
        console.log(`Loaded command: ${command.data.name}`);
    }
}

client.once(Events.ClientReady, readyClient => {
    console.log(`Logged in as ${readyClient.user.tag}`);
    console.log(`Loaded ${client.commands.size} command(s).`);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        await interaction.reply({
            content: 'Command not found.',
            ephemeral: true
        });
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(
            `Error in /${interaction.commandName}:`,
            error
        );

        const response = {
            content: 'An error occurred while executing this command.',
            ephemeral: true
        };

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(response).catch(console.error);
        } else {
            await interaction.reply(response).catch(console.error);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);