
require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes } = require('discord.js');

const commandsPath = path.join(__dirname, 'commands');

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

async function deployCommands() {
    if (!process.env.DISCORD_TOKEN ||
        !process.env.CLIENT_ID ||
        !process.env.GUILD_ID) {
        throw new Error('Missing DISCORD_TOKEN, CLIENT_ID or GUILD_ID in .env');
    }

    const files = getCommandFiles(commandsPath);
    const commands = [];

    for (const file of files) {
        const command = require(file);

        if (!command.data || !command.execute) {
            console.warn(`Skipping invalid command: ${file}`);
            continue;
        }

        commands.push(command.data.toJSON());
    }

    const rest = new REST({ version: '10' })
        .setToken(process.env.DISCORD_TOKEN);

    await rest.put(
        Routes.applicationGuildCommands(
            process.env.CLIENT_ID,
            process.env.GUILD_ID
        ),
        { body: commands }
    );

    console.log(`Successfully registered ${commands.length} slash command(s).`);
}

deployCommands().catch(error => {
    console.error('Command deployment failed:', error);
    process.exitCode = 1;
});
