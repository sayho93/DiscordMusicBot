import {Client, ClientOptions, Collection, MessageEmbed} from 'discord.js'
import {AudioPlayer, AudioPlayerStatus, AudioResource, createAudioPlayer, createAudioResource, joinVoiceChannel, StreamType, VoiceConnection} from '@discordjs/voice'
import {Log} from '../utils/logger'
import ytdl from 'ytdl-core'
import {formatVideo, onError} from '../utils/utils'
import {DiscordBotClientObj, MusicType, Song} from '../index'

const DiscordBotClient = (props: ClientOptions): DiscordBotClientObj => {
    let user = null
    const client: Client = new Client(props)
    const commands: Collection<string, any> = new Collection()
    let musicData: MusicType = {
        queue: [],
        isPlaying: false,
        volume: 1,
        player: null,
    }
    let connection: VoiceConnection | null = null

    const createPlayer = async (message: any) => {
        const player: AudioPlayer = createAudioPlayer()

        player
            .on(AudioPlayerStatus.Playing, () => {
                const currentItem = musicData.queue[0]
                if (currentItem !== undefined) {
                    const embed: MessageEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(`:: Currently playing :arrow_forward: ::`)
                        .setDescription(`${currentItem.title} (${currentItem.duration})`)
                        .setURL(currentItem.url)
                        .setThumbnail(currentItem.thumbnail)
                    message.channel.send({embeds: [embed]})
                    Log.info(`Currently playing ${currentItem.title}`)
                }
            })
            .on(AudioPlayerStatus.Idle, () => {
                if (musicData.queue.length > 1) {
                    Log.debug('queue length is not zero')
                    musicData.queue.shift()
                    return playSong(message.channel)
                } else {
                    Log.debug('queue empty')
                    musicData.isPlaying = false
                    setTimeout(() => {
                        if (musicData.queue.length <= 1 && !musicData.isPlaying) {
                            musicData = {
                                queue: [],
                                isPlaying: false,
                                volume: 1,
                                player: null,
                            }
                            message.channel.send(`Disconnected from channel due to inactivity`)
                            if (connection !== null) connection.destroy()
                        }
                    }, 180000)
                }
            })
            .on('error', err => {
                Log.error('error occurred')
                musicData.isPlaying = false
                if (err.message === 'Status code: 410') {
                    message.channel.send(`Unplayable Song: ${message.client.musicData.queue[0].title}`)
                    return
                } else {
                    message.channel.send('error occurred')
                    onError(err, message)
                    if (connection !== null) return connection.destroy()
                }
            })
        return player
    }

    const playSong = async (message: any) => {
        if (!musicData.queue.length) {
            message.channel.send('No songs in queue')
            return
        }

        connection = await joinVoiceChannel({
            channelId: musicData.queue[0].voiceChannel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
        })

        const video = await musicData.queue[0].video.fetch()
        const nextSong: Song | null = formatVideo(video, musicData.queue[0].voiceChannel)
        if (!nextSong) {
            message.channel.send('Could fetch video')
            return
        }
        musicData.queue[0] = nextSong

        let validate = ytdl.validateURL(musicData.queue[0].url)
        if (!validate) {
            Log.error('Please input a **valid** URL.')
            message.reply('Please input a **valid** URL.')
        }
        const stream = ytdl(musicData.queue[0].videoId, {
            filter: 'audioonly',
            quality: 'highestaudio',
            highWaterMark: 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
            liveBuffer: 4000,
        }).on('error', (error: any) => {
            message.reply(error)
            console.log(error)
        })

        const resource: AudioResource = createAudioResource(stream, {inputType: StreamType.Arbitrary})
        if (!musicData.player) musicData.player = await createPlayer(message)

        try {
            musicData.player.play(resource)
            connection.subscribe(musicData.player)
        } catch (err) {
            Log.error(err)
            message.channel.send('Error occurred on player.play()')
        }
    }

    return {commands, musicData, connection, playSong, client, user}
}

export default DiscordBotClient
