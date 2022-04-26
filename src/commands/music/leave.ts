import {SlashCommandBuilder} from '@discordjs/builders'
import {Message} from 'discord.js'
import {onError} from '../../utils/utils'
import {DiscordBotClientObj} from '../../index'

export default {
    data: new SlashCommandBuilder().setName('l').setDescription('Make Bot leave voice channel'),
    execute: async (message: Message, client: DiscordBotClientObj) => {
        if (!message.member?.voice.channel) return message.reply('You have to be in a voice channel to make bot leave')
        client.musicData.queue = []
        client.musicData.isPlaying = false
        try {
            client.connection?.destroy()
        } catch (err) {
            onError(err, message)
        }
    },
}
