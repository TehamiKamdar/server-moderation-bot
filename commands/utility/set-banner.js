
const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    MessageFlags
} = require('discord.js');

const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-banner')
        .setDescription('Set a custom background for welcome cards')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addAttachmentOption(option =>
            option
                .setName('image')
                .setDescription('Upload your custom banner background')
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
                content: 'You need the Manage Servers permission.',
                flags: MessageFlags.Ephemeral
            });
        }

        const image = interaction.options.getAttachment('image');

        const allowedTypes = [
            'image/png',
            'image/jpg',
            'image/jpeg',
            'image/webp'
        ];

        if (!allowedTypes.includes(image.contentType)) {
            return interaction.reply({
                content: 'Please upload a PNG, JPG, or WEBP image.',
                flags: MessageFlags.Ephemeral
            });
        }

        if (image.size > 8 * 1024 * 1024) {
            return interaction.reply({
                content: 'The image must be 8 MB or smaller.',
                flags: MessageFlags.Ephemeral
            });
        }

        try {
            db.prepare(`
                INSERT INTO welcome_banners (guild_id, image_url)
                VALUES (?, ?)
                ON CONFLICT(guild_id)
                DO UPDATE SET image_url = excluded.image_url
            `).run(interaction.guild.id, image.url);

            return interaction.reply({
                content: 'Custom welcome banner saved successfully! 🎨',
                flags: MessageFlags.Ephemeral
            });
        } catch (error) {
            console.error('Set banner error:', error);

            return interaction.reply({
                content: 'Failed to save the banner.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
