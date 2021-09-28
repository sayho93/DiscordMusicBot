const {SlashCommandBuilder} = require('@discordjs/builders')
const {Log} = require('../../utils/Logger')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Replies with user info'),
    async execute(interaction){
        const reply = `Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`
        await interaction.reply(reply)
        Log.info(reply)
    }
}