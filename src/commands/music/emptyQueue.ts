import {SlashCommandBuilder} from '@discordjs/builders'
import {Message} from 'discord.js'
import {DiscordBotClientObj} from '../../index'

export default {
    data: new SlashCommandBuilder().setName('eq').setDescription('Stop current playing music'),
    execute: async (message: Message, client: DiscordBotClientObj) => {
        if (!message.member?.voice.channel) return message.reply('You have to be in a voice channel to clear queue music')
        if (client.musicData.queue.length === 0) return message.reply('Queue is empty')

        client.musicData.queue = [client.musicData.queue[0]]
        client.musicData.isPlaying = false
        console.log(client.musicData)
        await message.reply('queue cleared')
    },
}
