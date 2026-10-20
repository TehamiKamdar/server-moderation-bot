
const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    MessageFlags
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a member from the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The member you want to ban')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for the ban')
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

        if (!interaction.memberPermissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.reply({
                content: 'You need the Ban Members permission to use this command.',
                flags: MessageFlags.Ephemeral
            });
        }

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (user.id === interaction.guild.ownerId) {
            return interaction.reply({
                content: 'The server owner cannot be banned.',
                flags: MessageFlags.Ephemeral
            });
        }

        if (user.id === interaction.user.id) {
            return interaction.reply({
                content: 'You cannot ban yourself.',
                flags: MessageFlags.Ephemeral
            });
        }

        if (user.id === interaction.client.user.id) {
            return interaction.reply({
                content: 'I cannot ban myself.',
                flags: MessageFlags.Ephemeral
            });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            const target = await interaction.guild.members.fetch(user.id);
            const botMember = interaction.guild.members.me;

            if (!target.bannable || !botMember.permissions.has(PermissionFlagsBits.BanMembers)) {
                return interaction.editReply(
                    'I cannot ban this member. Check my Ban Members permission and role hierarchy.'
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

            await target.ban({
                reason: `${reason} | Moderator: ${interaction.user.tag}`
            });

            return interaction.editReply(
                `Successfully banned **${user.tag}**.\nReason: ${reason}`
            );
        } catch (error) {
            console.error('Ban command error:', error);

            return interaction.editReply(
                'Failed to ban this member. Check the bot permissions and try again.'
            );
        }
    }
};
