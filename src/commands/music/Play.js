const {SlashCommandBuilder} = require('@discordjs/builders')
const {Log} = require('../../utils/Logger')
const {prefix, youtubeAPI} = require('../../../config.json')
const Utils = require('../../utils/Utils')
const {MessageEmbed, MessageActionRow, MessageSelectMenu} = require('discord.js')
const Youtube = require('simple-youtube-api')
const youtube = new Youtube(youtubeAPI)

module.exports = {
    data: new SlashCommandBuilder()
        .setName('p')
        .setDescription('Plays music with uri'),
    async execute(message){
        const args = message.content.slice(prefix.length).trim().split(/ +/g)
        if(args.length < 2){
            await message.reply(`parameter count doesn't match`)
            return
        }
        const voiceChannel = message.member.voice.channel
        Log.verbose(JSON.stringify(voiceChannel))
        if(!voiceChannel) return message.channel.send('You need to be in a voice channel to play music')
        const permissions = voiceChannel.permissionsFor(message.client.user)
        if(!permissions.has("CONNECT") || !permissions.has("SPEAK")) return message.channel.send("I need the permissions to join and speak in your voice channel")

        try{
            const query = args[1]
            if(query.match(/^(?!.*\?.*\bv=)https:\/\/(www\.)?youtube\.com\/.*\?.*\blist=.*$/)){
                try{
                    const playlist = await youtube.getPlaylist(query)
                    const videosObj = await playlist.getVideos()
                    let thumb
                    for(const [idx, item] of videosObj.entries()){
                        if(item.raw.status.privacyStatus !== 'private'){
                            if(idx === 0) thumb = item.thumbnails.high.url
                            message.client.musicData.queue.push(Utils.formatVideo(item, voiceChannel))
                        }
                    }

                    const queue = message.client.musicData.queue
                    Log.info(`queue length: ${queue.length}`)
                    Log.info(`next: ${JSON.stringify(queue[0])}`)

                    const embed = new MessageEmbed()
                        .setColor('#ffffff')
                        .setTitle('Queued')
                        .setDescription(`Queued ${videosObj.length} tracks`)
                        .addField(`Total Queue` ,`${queue.length} tracks`)
                        .addField(`Playlist` ,`:musical_note:  ${playlist.title} :musical_note: has been added to queue`)
                        .setThumbnail(thumb)
                    message.reply({embeds: [embed]})

                    if(message.client.musicData.isPlaying === false){
                        message.client.musicData.isPlaying = true
                        return message.client.playSong(message)
                    }
                }catch(err){
                    Log.error(err.stack)
                    return message.reply('Playlist is either private or it does not exist')
                }
            }else if(query.match(/https:\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/)){
                try{
                    const video = await youtube.getVideo(query)
                    const song = Utils.formatVideo(video, voiceChannel)
                    message.client.musicData.queue.push(song)

                    const queue = message.client.musicData.queue
                    Log.info(`Queue length: ${queue.length}`)
                    Log.info(`Current: ${JSON.stringify(queue[0])}`)

                    const embed = new MessageEmbed()
                        .setColor('#ffffff')
                        .setTitle('Queued')
                        .setURL(query)
                        .setDescription(`Queued 1 track`)
                        .addField(`Total Queue` ,`${queue.length} tracks`)
                        .addField(`Track` ,`:musical_note:  ${song.title} :musical_note: has been added to queue`)
                        .setThumbnail(song.thumbnail)
                    message.reply({embeds: [embed]})

                    if(message.client.musicData.isPlaying === false){
                        message.client.musicData.isPlaying = true
                        return message.client.playSong(message)
                    }
                } catch(err){
                    Log.error(err.stack)
                }
            }
            else{
                try{
                    let searchTxt = ''
                    args.forEach((item, idx) => {
                        if(idx !== 0) searchTxt += `${item}`
                    })

                    searchTxt = searchTxt.trim()
                    Log.debug(searchTxt)
                    const results = await youtube.searchVideos(searchTxt, 10)
                    // console.log(JSON.stringify(results))

                    const list = []
                    results.forEach(item => {
                        const url = `https://www.youtube.com/watch?v=${item.id}`
                        const title = item.raw.snippet.title
                        if(title.length >= 100) return
                        const selectItem = {
                            label: title,
                            description: title,
                            value: url,
                        }
                        list.push(selectItem)
                    })

                    Log.info(JSON.stringify(list))

                    const component = new MessageSelectMenu()
                        .setCustomId('select')
                        .setPlaceholder('재생할 노래 선택')
                        .addOptions(list)
                    const row = new MessageActionRow()
                        .addComponents(
                            component
                        )
                    await message.reply({content: `'${searchTxt}' 검색 결과`, components: [row]})
                } catch(err){
                    Log.error(err.stack)
                }
            }
        } catch(err){
            message.client.musicData.isPlaying = false
            Log.error(err.stack)
        }
    }
}