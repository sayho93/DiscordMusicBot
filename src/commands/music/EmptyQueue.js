const {SlashCommandBuilder} = require('@discordjs/builders')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eq')
        .setDescription('Stop current playing music'),
    async execute(message){
        if(!message.member.voice.channel) return message.reply('You have to be in a voice channel to clear queue music')
        if(message.client.musicData.queue.length === 0) return message.reply('Queue is empty')
        message.client.musicData.queue = []
        message.client.musicData.isPlaying = false
        message.reply('queue cleared')
    }
}