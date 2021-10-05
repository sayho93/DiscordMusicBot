import {SlashCommandBuilder} from "@discordjs/builders"
import {Message} from "discord.js"
import {DiscordBotClient} from "../../structures/DiscordBotClient"
import Utils from "../../utils/Utils";

export default {
    data: new SlashCommandBuilder()
        .setName('l')
        .setDescription('Make Bot leave voice channel'),
    execute: async (message: Message, client: DiscordBotClient) => {
        if(!message.member?.voice.channel) return message.reply('You have to be in a voice channel to make bot leave')
        client.musicData.queue = []
        client.musicData.isPlaying = false
        try{
            client.connection?.destroy()
        } catch(err){
            Utils.onError(err, message)
        }
    }
}
