import {SlashCommandBuilder} from "@discordjs/builders"
import {Log} from '../../utils/Logger'
import {Message} from "discord.js"

export default {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Replies with server info'),
    async execute(interaction: Message){
        const reply = `Server name: ${interaction.guild?.name}\nTotal members: ${interaction.guild?.memberCount}`
        await interaction.reply(reply)
        Log.info(reply)
    }
}