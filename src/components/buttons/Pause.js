const { ButtonStyle, EmbedBuilder, ButtonBuilder } = require('discord.js');
const Button = require('../../structures/Button');

module.exports = class Pause extends Button {
    constructor(client) {
        super(client, {
            id: 'PAUSE_BUTTON',
        });
    }
    async run(client, interaction) {
        if (interaction.guild.members.me.voice.channel && !interaction.guild.members.me.voice.channel.equals(interaction.member.voice.channel)) return interaction.reply({ content: 'You must be in the same voice channel as the bot to use this button.', ephemeral: true });
        const player = client.music.players.get(interaction.guild.id);
        if (!player) return;

        player.pause(!player.paused);

        if (player.nowPlayingMessage) {
            const buttonRow = interaction.message.components[0];
            buttonRow.components[2] = new ButtonBuilder()
                .setCustomId('PAUSE_BUTTON')
                .setStyle(ButtonStyle.Primary)
                .setEmoji(player.paused ? client.config.emojis.resume : client.config.emojis.pause);
            await player.nowPlayingMessage.edit({ components: [buttonRow] });
        }

        const embed = new EmbedBuilder()
            .setColor(client.config.colors.default)
            .setAuthor({ name: `Song is now ${player.playing ? 'resumed' : 'paused'}.`, iconURL: interaction.member.displayAvatarURL() });
        await interaction.reply({ embeds: [embed] });
    }
};