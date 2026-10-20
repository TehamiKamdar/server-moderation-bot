
const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    MessageFlags
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('untimeout')
        .setDescription('Remove a member timeout')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Member whose timeout should be removed')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for removing the timeout')
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

        if (!interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.reply({
                content: 'You need the Moderate Members permission.',
                flags: MessageFlags.Ephemeral
            });
        }

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (user.id === interaction.user.id || user.id === interaction.client.user.id) {
            return interaction.reply({
                content: 'You cannot use this command on yourself or the bot.',
                flags: MessageFlags.Ephemeral
            });
        }

        if (user.id === interaction.guild.ownerId) {
            return interaction.reply({
                content: 'The server owner cannot be modified.',
                flags: MessageFlags.Ephemeral
            });
        }

        await interaction.deferReply({
            flags: MessageFlags.Ephemeral
        });

        try {
            const target = await interaction.guild.members.fetch(user.id);
            const botMember = interaction.guild.members.me;

            if (
                !botMember.permissions.has(PermissionFlagsBits.ModerateMembers) ||
                !target.moderatable
            ) {
                return interaction.editReply(
                    'I cannot modify this member. Check my permissions and role hierarchy.'
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

            if (!target.isCommunicationDisabled()) {
                return interaction.editReply(
                    'This member does not currently have an active timeout.'
                );
            }

            await target.timeout(
                null,
                `${reason} | Moderator: ${interaction.user.tag}`
            );

            return interaction.editReply(
                `Successfully removed the timeout from **${user.tag}**.\nReason: ${reason}`
            );
        } catch (error) {
            console.error('Untimeout command error:', error);

            return interaction.editReply(
                'Failed to remove the timeout. Check the bot permissions and try again.'
            );
        }
    }
};
