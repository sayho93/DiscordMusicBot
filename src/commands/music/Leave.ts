import {SlashCommandBuilder} from "@discordjs/builders"
import {Message} from "discord.js"
import {DiscordBotClient} from "../../structures/DiscordBotClient"

export default {
    data: new SlashCommandBuilder()
        .setName('l')
        .setDescription('Make Bot leave voice channel'),
    async execute(message: Message, client: DiscordBotClient){
        if(!message.member?.voice.channel) return message.reply('You have to be in a voice channel to make bot leave')
        client.musicData.queue = []
        client.musicData.isPlaying = false
        return client.connection?.destroy()
    }
}