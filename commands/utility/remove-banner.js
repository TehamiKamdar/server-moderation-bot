
const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    MessageFlags
} = require('discord.js');

const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-banner')
        .setDescription('Remove the custom welcome banner')
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageChannels
        ),

    async execute(interaction) {
        if (!interaction.inGuild()) {
            return interaction.reply({
                content: 'This command can only be used in a server.',
                flags: MessageFlags.Ephemeral
            });
        }

        if (!interaction.memberPermissions.has(
            PermissionFlagsBits.ManageGuild
        )) {
            return interaction.reply({
                content: 'You need the Manage Servers permission.',
                flags: MessageFlags.Ephemeral
            });
        }

        try {
            const result = db.prepare(`
                DELETE FROM welcome_banners
                WHERE guild_id = ?
            `).run(interaction.guild.id);

            if (result.changes === 0) {
                return interaction.reply({
                    content: 'Banner is not available in this server.',
                    flags: MessageFlags.Ephemeral
                });
            }

            return interaction.reply({
                content: 'Welcome banner has been removed. ✅',
                flags: MessageFlags.Ephemeral
            });
        } catch (error) {
            console.error('Remove banner error:', error);

            return interaction.reply({
                content: 'Some error occured removing banner.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
