import {SlashCommandBuilder} from '@discordjs/builders'
import {Message} from 'discord.js'
import {DiscordBotClient} from '#root/src'

export default {
    data: new SlashCommandBuilder().setName('eq').setDescription('Stop current playing music'),
    execute: async (message: Message, client: DiscordBotClient) => {
        if (!message.member?.voice.channel) return message.reply('You have to be in a voice channel to clear queue music')
        const musicData = client.getMusicData()
        if (musicData.queue.length === 0) return message.reply('Queue is empty')

        client.setMusicData({
            ...musicData,
            queue: [musicData.queue[0]],
            isPlaying: false,
        })
        await message.reply('queue cleared')
    },
}
