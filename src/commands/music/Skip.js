const {SlashCommandBuilder} = require('@discordjs/builders')
const {Log} = require('../../utils/Logger')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('s')
        .setDescription('Skip current playing music'),
    async execute(message){
        Log.verbose('Skipping song...')
        if(message.client.musicData.queue.length === 0) return message.reply('queue is empty')
        // message.client.musicData.queue.shift()
        await message.client.playSong(message)
    }
}