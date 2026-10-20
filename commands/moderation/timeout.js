
const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    MessageFlags
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Temporarily timeout a server member')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Member to timeout')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('minutes')
                .setDescription('Timeout duration in minutes (1–40320)')
                .setMinValue(1)
                .setMaxValue(40320)
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the timeout')
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
        const minutes = interaction.options.getInteger('minutes');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (user.id === interaction.user.id || user.id === interaction.client.user.id) {
            return interaction.reply({
                content: 'You cannot timeout yourself or the bot.',
                flags: MessageFlags.Ephemeral
            });
        }

        if (user.id === interaction.guild.ownerId) {
            return interaction.reply({
                content: 'The server owner cannot be timed out.',
                flags: MessageFlags.Ephemeral
            });
        }

        await interaction.deferReply({
            flags: MessageFlags.Ephemeral
        });

        try {
            const target = await interaction.guild.members.fetch(user.id);
            const botMember = interaction.guild.members.me;

            if (!botMember.permissions.has(PermissionFlagsBits.ModerateMembers) || !target.moderatable) {
                return interaction.editReply(
                    'I cannot timeout this member. Check my permissions and role hierarchy.'
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

            await target.timeout(
                minutes * 60 * 1000,
                `${reason} | Moderator: ${interaction.user.tag}`
            );

            return interaction.editReply(
                `Successfully timed out **${user.tag}** for ${minutes} minute(s).\nReason: ${reason}`
            );
        } catch (error) {
            console.error('Timeout command error:', error);

            return interaction.editReply(
                'Failed to timeout this member. Check the bot permissions and try again.'
            );
        }
    }
};
