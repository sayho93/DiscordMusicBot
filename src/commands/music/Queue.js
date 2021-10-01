const {SlashCommandBuilder} = require('@discordjs/builders')
const {MessageEmbed} = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('q')
        .setDescription('Stop current playing music'),
    async execute(message){
        if(!message.member.voice.channel) return message.reply('You have to be in a voice channel to see queue')
        if(message.client.musicData.queue.length === 1) return message.reply('Queue is empty')

        const queue = message.client.musicData.queue
        const embed = new MessageEmbed()
            .setColor('#ffffff')
            .setTitle('Queue')
            .setThumbnail(queue[1].thumbnail)

        queue.forEach((item, idx) => {
            if(idx !== 0) embed.addField(`${idx}`, `${item.title} (${item.duration})`)
        })
        message.reply({embeds: [embed]})
    }
}