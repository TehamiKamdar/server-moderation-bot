
const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    MessageFlags
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Delete multiple messages from this channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('Number of messages to delete (1–1000)')
                .setMinValue(1)
                .setMaxValue(1000)
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
            PermissionFlagsBits.ManageMessages
        )) {
            return interaction.reply({
                content: 'You need the Manage Messages permission.',
                flags: MessageFlags.Ephemeral
            });
        }

        const amount = interaction.options.getInteger('amount');

        await interaction.deferReply({
            flags: MessageFlags.Ephemeral
        });

        try {
            const channel = interaction.channel;
            const botMember = interaction.guild.members.me;

            if (
                !channel ||
                typeof channel.bulkDelete !== 'function'
            ) {
                return interaction.editReply(
                    'This command cannot be used in this channel.'
                );
            }

            if (
                !botMember.permissionsIn(channel).has(
                    PermissionFlagsBits.ManageMessages
                )
            ) {
                return interaction.editReply(
                    'I need the Manage Messages permission in this channel.'
                );
            }

            let totalDeleted = 0;
            let remaining = amount;

            while (remaining > 0) {
                const batchSize = Math.min(remaining, 100);

                const deleted = await channel.bulkDelete(
                    batchSize,
                    true
                );

                totalDeleted += deleted.size;

                if (deleted.size === 0) {
                    break;
                }

                remaining -= batchSize;

                // Small pause between batches
                if (remaining > 0) {
                    await new Promise(resolve =>
                        setTimeout(resolve, 500)
                    );
                }
            }

            return interaction.editReply(
                `Successfully deleted **${totalDeleted}** message(s).` +
                (totalDeleted < amount
                    ? '\nSome messages may have been older than 14 days.'
                    : '')
            );

        } catch (error) {
            console.error('Purge command error:', error);

            return interaction.editReply(
                'Failed to delete messages. Check the bot permissions and try again.'
            );
        }
    }
};
