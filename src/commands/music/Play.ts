import {SlashCommandBuilder} from "@discordjs/builders"
import {Log} from '../../utils/Logger'
import {prefix, youtubeAPI} from '../../../config.json'
import Utils from '../../utils/Utils'
import {MessageEmbed, MessageActionRow, MessageSelectMenu, VoiceChannel, StageChannel} from "discord.js"
import {DiscordBotClient} from "../../structures/DiscordBotClient"
import {Message} from "discord.js"

const Youtube = require('simple-youtube-api')
const youtube = new Youtube(youtubeAPI)

export default {
    data: new SlashCommandBuilder()
        .setName('p')
        .setDescription('Plays music with uri'),
    async execute(message: Message, client: DiscordBotClient){
        const args: string[] = message.content.slice(prefix.length).trim().split(/ +/g)
        if(args.length < 2){
            await message.reply(`parameter count doesn't match`)
            return
        }
        const voiceChannel: VoiceChannel | StageChannel | null | undefined = message.member?.voice.channel
        Log.verbose(JSON.stringify(voiceChannel))
        if(!voiceChannel) return message.channel.send('You need to be in a voice channel to play music')
        // @ts-ignore
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
                            client.musicData.queue.push(Utils.formatVideo(item, voiceChannel))
                        }
                    }

                    const queue = client.musicData.queue
                    Log.info(`queue length: ${queue.length}`)
                    Log.info(`next: ${JSON.stringify(queue[0].title)}`)

                    const embed = new MessageEmbed()
                        .setColor('#ffffff')
                        .setTitle('Queued')
                        .setDescription(`Queued ${videosObj.length} tracks`)
                        .addField(`Total Queue` ,`${queue.length} tracks`)
                        .addField(`Playlist` ,`:musical_note:  ${playlist.title} :musical_note: has been added to queue`)
                        .setThumbnail(thumb)
                    await message.reply({embeds: [embed]})

                    if(!client.musicData.isPlaying){
                        client.musicData.isPlaying = true
                        return client.playSong(message)
                    }
                }catch(err){
                    Utils.onError(err, message)
                    return message.reply('Playlist is either private or it does not exist')
                }
            } else if(query.match(/https:\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/)){
                try{
                    const video = await youtube.getVideo(query)
                    const song = Utils.formatVideo(video, voiceChannel)
                    client.musicData.queue.push(song)

                    const queue = client.musicData.queue
                    Log.info(`Queue length: ${queue.length}`)
                    Log.info(`Current: ${JSON.stringify(queue[0].title)}`)

                    const embed = new MessageEmbed()
                        .setColor('#ffffff')
                        .setTitle('Queued')
                        .setURL(query)
                        .setDescription(`Queued 1 track`)
                        .addField(`Total Queue` ,`${queue.length} tracks`)
                        .addField(`Track` ,`:musical_note:  ${song.title} :musical_note: has been added to queue`)
                        .setThumbnail(song.thumbnail)
                    await message.reply({embeds: [embed]})

                    if(!client.musicData.isPlaying){
                        client.musicData.isPlaying = true
                        return client.playSong(message)
                    }
                } catch(err){
                    Utils.onError(err, message)
                }
            } else{
                try{
                    let searchTxt = ''
                    args.forEach((item, idx) => {
                        if(idx !== 0) searchTxt += `${item}`
                    })

                    searchTxt = searchTxt.trim()
                    Log.debug(searchTxt)
                    const results = await youtube.searchVideos(searchTxt, 10)
                    // console.log(JSON.stringify(results))

                    const list: {label: string, description: string, value: string}[] = []
                    results.forEach((item: any) => {
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

                    // Log.info(JSON.stringify(list))

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
                    Utils.onError(err, message)
                }
            }
        } catch(err){
            client.musicData.isPlaying = false
            Utils.onError(err, message)
        }
    }
}
