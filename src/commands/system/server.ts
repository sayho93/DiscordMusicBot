import {SlashCommandBuilder} from '@discordjs/builders'
import {Message} from 'discord.js'

export default {
    data: new SlashCommandBuilder().setName('server').setDescription('Replies with server info'),

    execute: async (interaction: Message) => {
        const reply = `Server name: ${interaction.guild?.name}\nTotal members: ${interaction.guild?.memberCount}`
        await interaction.reply(reply)
    },
}
