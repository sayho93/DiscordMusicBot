import {SlashCommandBuilder} from '@discordjs/builders'
import {Message} from 'discord.js'
import {dispatchErrorLog} from '#utils/utils'
import {DiscordBotClient} from '#root/src'

export default {
    data: new SlashCommandBuilder().setName('l').setDescription('Make Bot leave voice channel'),
    execute: async (message: Message, client: DiscordBotClient) => {
        if (!message.member?.voice.channel) return message.reply('You have to be in a voice channel to make bot leave')
        client.setMusicData({
            ...client.getMusicData(),
            queue: [],
            isPlaying: false,
        })

        try {
            client.getConnection()?.destroy()
            client.setConnection(null)
        } catch (err) {
            await dispatchErrorLog(err)
        }
    },
}
