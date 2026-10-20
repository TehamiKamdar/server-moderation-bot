
const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    MessageFlags
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a member from the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The member you want to kick')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for the kick')
                .setMaxLength(500)
                .setRequired(false)
        ),

    async execute(interaction) {
        if (!interaction.inGuild()) {
            return interaction.reply({
                content: 'This command can only be used in a server.',
                flags: MessageFlags.Ephemeral
            });
        }

        if (!interaction.memberPermissions.has(PermissionFlagsBits.KickMembers)) {
            return interaction.reply({
                content: 'You need the Kick Members permission to use this command.',
                flags: MessageFlags.Ephemeral
            });
        }

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (user.id === interaction.guild.ownerId) {
            return interaction.reply({
                content: 'The server owner cannot be kicked.',
                flags: MessageFlags.Ephemeral
            });
        }

        if (user.id === interaction.user.id) {
            return interaction.reply({
                content: 'You cannot kick yourself.',
                flags: MessageFlags.Ephemeral
            });
        }

        if (user.id === interaction.client.user.id) {
            return interaction.reply({
                content: 'I cannot kick myself.',
                flags: MessageFlags.Ephemeral
            });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            const target = await interaction.guild.members.fetch(user.id);
            const botMember = interaction.guild.members.me;

            if (!target.kickable || !botMember.permissions.has(PermissionFlagsBits.KickMembers)) {
                return interaction.editReply(
                    'I cannot kick this member. Check my Kick Members permission and role hierarchy.'
                );
            }

            if (
                interaction.guild.ownerId !== interaction.user.id &&
                interaction.member.roles.highest.comparePositionTo(target.roles.highest) <= 0
            ) {
                return interaction.editReply(
                    'Your highest role must be above the target member’s highest role.'
                );
            }

            await target.kick(
                `${reason} | Moderator: ${interaction.user.tag}`
            );

            return interaction.editReply(
                `Successfully kicked **${user.tag}**.\nReason: ${reason}`
            );
        } catch (error) {
            console.error('Kick command error:', error);

            return interaction.editReply(
                'Failed to kick this member. Check the bot permissions and try again.'
            );
        }
    }
};
