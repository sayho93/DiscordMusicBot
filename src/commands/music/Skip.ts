import {SlashCommandBuilder} from "@discordjs/builders"
import {Log} from '../../utils/Logger'
import {Message} from "discord.js"
import {DiscordBotClient} from "../../structures/DiscordBotClient"

export default {
    data: new SlashCommandBuilder()
        .setName('s')
        .setDescription('Skip current playing music'),
    async execute(message: Message, client: DiscordBotClient){
        Log.verbose('Skipping song...')
        if(client.musicData.queue.length <= 1){
            await message.reply('Nothing to play')
            await client.stopSong()
            return
        }
        client.musicData.queue.shift()
        await client.playSong(message)
    }
}