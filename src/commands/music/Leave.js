const {SlashCommandBuilder} = require('@discordjs/builders')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('l')
        .setDescription('Make Bot leave voice channel'),
    async execute(message){
        if(!message.member.voice.channel) return message.reply('You have to be in a voice channel to make bot leave')
        message.client.musicData.queue = []
        message.client.musicData.isPlaying = false
        return message.client.connection.destroy()
    }
}