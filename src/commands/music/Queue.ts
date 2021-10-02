import {SlashCommandBuilder} from "@discordjs/builders"
import {ClientEvents, Message, MessageEmbed} from "discord.js"
import {DiscordBotClient} from "../../structures/DiscordBotClient";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('q')
        .setDescription('Stop current playing music'),
    async execute(message: Message, client: DiscordBotClient){
        if(!message.member?.voice.channel) return message.reply('You have to be in a voice channel to see queue')
        if(client.musicData.queue.length === 1) return message.reply('Queue is empty')

        const queue: any[] = client.musicData.queue
        const embed: MessageEmbed = new MessageEmbed()
            .setColor('#ffffff')
            .setTitle('Queue')
            .setThumbnail(queue[1].thumbnail)

        queue.forEach((item, idx) => {
            if(idx !== 0) embed.addField(`${idx}`, `${item.title} (${item.duration})`)
        })
        await message.reply({embeds: [embed]})
    }
}
