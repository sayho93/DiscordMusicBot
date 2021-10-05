import {SlashCommandBuilder} from "@discordjs/builders"
import {Message, MessageEmbed} from "discord.js"
import {DiscordBotClient} from "../../structures/DiscordBotClient";

export default {
    data: new SlashCommandBuilder()
        .setName('q')
        .setDescription('Stop current playing music'),
    execute: async (message: Message, client: DiscordBotClient) => {
        if(!message.member?.voice.channel) return message.reply('You have to be in a voice channel to see queue')
        if(client.musicData.queue.length === 1) return message.reply('Queue is empty')

        const queue: any[] = client.musicData.queue
        const embed: MessageEmbed = new MessageEmbed()
            .setColor('#ffffff')
            .setTitle('Queue')
            .setThumbnail(queue[1].thumbnail)

        queue.forEach((item, idx) => {
            if(idx !== 0) embed.addField(`${idx}`, `${item.title}`)
        })
        await message.reply({embeds: [embed]})
    }
}
