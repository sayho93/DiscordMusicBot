import {SlashCommandBuilder} from '@discordjs/builders'
import {Log} from '../../utils/logger'
import {Message} from 'discord.js'
import {DiscordBotClientObj} from '../../index'

export default {
    data: new SlashCommandBuilder().setName('s').setDescription('Skip current playing music'),
    execute: async (message: Message, client: DiscordBotClientObj) => {
        if (!message.member?.voice.channel) return message.reply('You have to be in a voice channel to see queue')
        Log.verbose('Skipping song...')
        if (client.musicData.queue.length <= 1) {
            await message.reply('Nothing to play')
            client.musicData.queue = []
            client.musicData.player?.stop()
            return
        }
        client.musicData.queue.shift()
        await client.playSong(message.channel)
    },
}