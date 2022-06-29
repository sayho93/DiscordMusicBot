import {SlashCommandBuilder} from '@discordjs/builders'
import {Message, MessageEmbed} from 'discord.js'
import {DiscordBotClient, Song} from '#root/src'

export default {
    data: new SlashCommandBuilder().setName('q').setDescription('Stop current playing music'),
    execute: async (message: Message, client: DiscordBotClient) => {
        if (!message.member?.voice.channel) return message.reply('You have to be in a voice channel to see queue')
        const musicData = client.getMusicData()
        if (musicData.queue.length === 1 || !musicData.queue.length) return message.reply('Queue is empty')

        const queue: Song[] = musicData.queue
        const embed: MessageEmbed = new MessageEmbed().setColor('#ffffff').setTitle('Queue').setThumbnail(queue[1].thumbnail)

        queue.forEach((item, idx) => {
            if (idx !== 0) embed.addField(`${idx}`, `${item.title}`)
        })
        await message.reply({embeds: [embed]})
    },
}
