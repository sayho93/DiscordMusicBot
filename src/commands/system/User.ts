import {SlashCommandBuilder} from '@discordjs/builders'
import {Message, User} from 'discord.js'

export default {
    data: new SlashCommandBuilder().setName('user').setDescription('Replies with user info'),
    execute: async (message: Message) => {
        const user: User = message.author
        const reply: string = `Your tag: ${user.tag}\nYour id: ${user.id}`
        await message.reply(reply)
    },
}
