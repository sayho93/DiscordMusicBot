const {SlashCommandBuilder} = require('@discordjs/builders')
const {Log} = require('../../utils/Logger')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Replies with server info'),
    async execute(interaction){
        const reply = `Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`
        await interaction.reply(reply)
        Log.info(reply)
    }
}