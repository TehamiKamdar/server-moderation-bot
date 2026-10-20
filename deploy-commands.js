require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
    new SlashCommandBuilder().setName('ping').setDescription("Checks if bot is online or not.")
].map(command => command.toJSON());


const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

async function deployCommands(){
    try {
        console.log('Registering Slash Commands....')
    
        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID , process.env.GUILD_ID
            ), { body: commands }
        )

        console.log("Slash Commands registered completely.")
    }
    catch(error){
        console.log(error)
    }
}

deployCommands()