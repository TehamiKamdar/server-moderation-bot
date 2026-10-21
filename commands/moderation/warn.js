
const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    MessageFlags
} = require('discord.js');

const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Give a warning to a server member')
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ModerateMembers
        )
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Member to warn')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for the warning')
                .setMaxLength(500)
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
            PermissionFlagsBits.ModerateMembers
        )) {
            return interaction.reply({
                content: 'You need the Moderate Members permission.',
                flags: MessageFlags.Ephemeral
            });
        }

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');

        if (
            user.id === interaction.user.id ||
            user.id === interaction.client.user.id
        ) {
            return interaction.reply({
                content: 'You cannot warn yourself or the bot.',
                flags: MessageFlags.Ephemeral
            });
        }

        if (user.id === interaction.guild.ownerId) {
            return interaction.reply({
                content: 'You cannot warn the server owner.',
                flags: MessageFlags.Ephemeral
            });
        }

        await interaction.deferReply({
            flags: MessageFlags.Ephemeral
        });

        try {
            await interaction.guild.members.fetch(user.id);

            const result = db.prepare(`
                INSERT INTO warnings (
                    guild_id,
                    user_id,
                    moderator_id,
                    reason
                )
                VALUES (?, ?, ?, ?)
            `).run(
                interaction.guild.id,
                user.id,
                interaction.user.id,
                reason
            );

            return interaction.editReply(
                `Warning issued to **${user.tag}**.\n` +
                `Warning ID: **${result.lastInsertRowid}**\n` +
                `Reason: ${reason}`
            );
        } catch (error) {
            console.error('Warn command error:', error);

            return interaction.editReply(
                'Failed to issue the warning. Check the bot and database.'
            );
        }
    }
};
