import {SlashCommandBuilder} from '@discordjs/builders'
import {Message} from 'discord.js'
import {DiscordBotClient} from '#root/src'

export default {
    data: new SlashCommandBuilder().setName('eq').setDescription('Stop current playing music'),
    execute: async (message: Message, client: DiscordBotClient) => {
        if (!message.member?.voice.channel) return message.reply('You have to be in a voice channel to clear queue music')
        if (client.musicData.queue.length === 0) return message.reply('Queue is empty')

        client.musicData.queue = [client.musicData.queue[0]]
        client.musicData.isPlaying = false
        await message.reply('queue cleared')
    },
}
