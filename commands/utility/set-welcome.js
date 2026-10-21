
const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChannelType,
    MessageFlags
} = require('discord.js');

const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-welcome')
        .setDescription('Set the channel for welcome messages')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('Select the welcome channel')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
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
                content: 'You need the Manage Server permission.',
                flags: MessageFlags.Ephemeral
            });
        }

        const channel = interaction.options.getChannel('channel');

        const botMember = interaction.guild.members.me;

        if (!botMember.permissionsIn(channel).has([
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages
        ])) {
            return interaction.reply({
                content: 'I need View Channel and Send Messages permissions in that channel.',
                flags: MessageFlags.Ephemeral
            });
        }

        db.prepare(`
            INSERT INTO welcome_settings (guild_id, channel_id)
            VALUES (?, ?)
            ON CONFLICT(guild_id)
            DO UPDATE SET channel_id = excluded.channel_id
        `).run(interaction.guild.id, channel.id);

        return interaction.reply({
            content: `Welcome channel set to ${channel} successfully!`,
            flags: MessageFlags.Ephemeral
        });
    }
};
