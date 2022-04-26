import {SlashCommandBuilder} from '@discordjs/builders'
import {Message, MessageEmbed} from 'discord.js'
import {DiscordBotClientObj} from '../../index'

export default {
    data: new SlashCommandBuilder().setName('q').setDescription('Stop current playing music'),
    execute: async (message: Message, client: DiscordBotClientObj) => {
        if (!message.member?.voice.channel) return message.reply('You have to be in a voice channel to see queue')
        if (client.musicData.queue.length === 1 || !client.musicData.queue.length) return message.reply('Queue is empty')

        const queue: any[] = client.musicData.queue
        const embed: MessageEmbed = new MessageEmbed().setColor('#ffffff').setTitle('Queue').setThumbnail(queue[1].thumbnail)

        queue.forEach((item, idx) => {
            if (idx !== 0) embed.addField(`${idx}`, `${item.title}`)
        })
        await message.reply({embeds: [embed]})
    },
}