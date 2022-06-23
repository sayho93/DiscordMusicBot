import {SlashCommandBuilder} from '@discordjs/builders'
import {Log} from '#utils/logger'
import {Message} from 'discord.js'
import {DiscordBotClient} from '#root/src'

export default {
    data: new SlashCommandBuilder().setName('s').setDescription('Skip current playing music'),
    execute: async (message: Message, client: DiscordBotClient) => {
        if (!message.member?.voice.channel) return message.reply('You have to be in a voice channel to see queue')
        Log.verbose('Skipping song...')
        const musicData = client.getMusicData()
        if (musicData.queue.length <= 1) {
            await message.reply('Nothing to play')
            musicData.queue = []
            musicData.player?.stop()
            return
        }
        musicData.queue.shift()
        await client.playSong(message.channel)
    },
}
