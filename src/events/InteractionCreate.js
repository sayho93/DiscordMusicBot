const {Log} = require('../utils/Logger')
const {MessageEmbed} = require('discord.js')
const Youtube = require('simple-youtube-api')
const {youtubeAPI} = require('../../config.json')
const Utils = require('../utils/Utils')
const youtube = new Youtube(youtubeAPI)

module.exports = {
    name: 'interactionCreate',
    async execute(interaction){
        if(interaction.isSelectMenu()){
            try{
                const video = await youtube.getVideo(interaction.values[0])
                const song = Utils.formatVideo(video, interaction.member.voice.channel)
                interaction.client.musicData.queue.push(song)

                const queue = interaction.client.musicData.queue
                Log.info(queue.length)
                Log.info(JSON.stringify(queue[queue.length - 1]))

                const embed = new MessageEmbed()
                    .setColor('#ffffff')
                    .setTitle('Queued')
                    // .setURL(interaction.values[0])
                    .setDescription(`Queued 1 track`)
                    .addField(`Total Queue` ,`${queue.length} tracks`)
                    .addField(`Track` ,`:musical_note:  ${song.title} :musical_note: has been added to queue`)
                    .setThumbnail(song.thumbnail)
                interaction.reply({embeds: [embed]})

                if(interaction.client.musicData.isPlaying === false){
                    interaction.client.musicData.isPlaying = true
                    return interaction.client.playSong(interaction)
                }
            } catch(err){
                Log.error(err.stack)
            }
        }

        if(interaction.isCommand()){
            const command = interaction.client.commands.get(interaction.commandName)
            if(!command) return
            try{
                Log.info(`request:: command: ${interaction.commandName}, user: ${interaction.user.tag}`)
                await command.execute(interaction)
            }catch(err){
                Log.error(err.stack)
                await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true})
            }
        }
    },
}