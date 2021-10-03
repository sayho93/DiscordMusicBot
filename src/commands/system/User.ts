import {SlashCommandBuilder} from "@discordjs/builders"
import {Log} from "../../utils/Logger"
import {Message, User} from "discord.js"

export default {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Replies with user info'),
    async execute(message: Message){
        const user: User = message.author
        const reply: string = `Your tag: ${user.tag}\nYour id: ${user.id}`
        await message.reply(reply)
        Log.info(reply)
    }
}